import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

// Skupinsko dodeljevanje naloge: za vsako izbrano osebo ustvari ločeno nalogo in ji pošlje e-pošto.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const userIds: (string | number)[] = Array.isArray(body?.userIds) ? body.userIds : []
  const naslov = String(body?.naslov || '').trim()
  const opis = String(body?.opis || '').trim()
  const rok = body?.rok ? String(body.rok) : undefined
  if (!naslov) return NextResponse.json({ ok: false, error: 'Vnesi naslov naloge.' }, { status: 400 })
  if (userIds.length === 0) return NextResponse.json({ ok: false, error: 'Izberi vsaj eno osebo.' }, { status: 400 })

  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const rokBesedilo = rok
    ? (() => {
        try {
          return new Date(rok).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })
        } catch {
          return ''
        }
      })()
    : ''

  let ustvarjeno = 0
  for (const id of userIds) {
    try {
      await payload.create({
        collection: 'naloge',
        data: { naslov, opis: opis || undefined, kandidat: id, status: 'odprta', rok },
        overrideAccess: true,
      })
      ustvarjeno++
    } catch (e) {
      console.error('Napaka pri ustvarjanju naloge:', e)
      continue
    }
    // E-pošta o dodeljeni nalogi (best-effort).
    try {
      const u = (await payload.findByID({ collection: 'users', id, depth: 0, overrideAccess: true })) as {
        email?: string
        ime?: string
      }
      if (u?.email) {
        const pozdrav = u.ime ? `Pozdravljen/-a, ${esc(u.ime)},` : 'Pozdravljen/-a,'
        await payload.sendEmail({
          to: u.email,
          subject: `Nova naloga: ${naslov}`,
          html: `
            <p>${pozdrav}</p>
            <p>dodeljena vam je nova naloga v sistemu Demokrati Radovljica:</p>
            <p style="font-size:15px"><strong>${esc(naslov)}</strong></p>
            ${opis ? `<p>${esc(opis).replace(/\n/g, '<br/>')}</p>` : ''}
            ${rokBesedilo ? `<p><strong>Rok:</strong> ${esc(rokBesedilo)}</p>` : ''}
            <p><a href="${base}/admin" style="display:inline-block;background:#00bbc1;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Odpri portal</a></p>
            <p style="font-size:13px;color:#555">Ko nalogo opraviš, ji v portalu spremeni status na »Zaključena«.</p>
            <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
          `,
        })
      }
    } catch (e) {
      console.error('E-pošta o nalogi ni bila poslana:', e)
    }
  }

  return NextResponse.json({ ok: true, count: ustvarjeno })
}
