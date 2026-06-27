import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

// Pošlji poljubno e-pošto izbranemu uporabniku (gumb na zapisu). Samo administrator.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const userId = body?.userId
  const zadeva = String(body?.zadeva || '').trim()
  const besedilo = String(body?.besedilo || '').trim()
  if (!userId || !zadeva || !besedilo) {
    return NextResponse.json({ ok: false, error: 'Vnesi zadevo in besedilo.' }, { status: 400 })
  }

  let u: { email?: string }
  try {
    u = (await payload.findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true })) as {
      email?: string
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'Uporabnik ni najden.' }, { status: 404 })
  }
  if (!u?.email) return NextResponse.json({ ok: false, error: 'Uporabnik nima e-naslova.' }, { status: 400 })

  try {
    await payload.sendEmail({
      to: u.email,
      subject: zadeva,
      html: `<p>${esc(besedilo).replace(/\n/g, '<br/>')}</p>
             <p style="font-size:12px;color:#888">Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>`,
    })
  } catch (e) {
    console.error('E-pošta uporabniku ni bila poslana:', e)
    return NextResponse.json(
      { ok: false, error: 'Sporočila ni bilo mogoče poslati.', detail: (e as Error).message },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
