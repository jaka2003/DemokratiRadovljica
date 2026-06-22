import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isUrednik } from '@/access/roles'
import { DOGODEK_TIPI } from '@/collections/Dogodki'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

// Pošlje e-poštno vabilo vsem udeležencem dogodka (skupine + posamezniki).
// Dostop: administrator ali urednik.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isUrednik(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const id = body?.id
  if (!id) return NextResponse.json({ ok: false, error: 'Najprej shrani dogodek.' }, { status: 400 })

  let dogodek: Record<string, unknown>
  try {
    dogodek = (await payload.findByID({ collection: 'dogodki', id, depth: 1, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    return NextResponse.json({ ok: false, error: 'Dogodek ni najden.' }, { status: 404 })
  }

  // Zberi e-naslove: posamezni udeleženci + vse osebe iz izbranih skupin (vlog).
  const emails = new Set<string>()
  for (const u of (dogodek.udelezenci as { email?: string }[] | undefined) || []) {
    if (u && typeof u === 'object' && u.email) emails.add(String(u.email))
  }
  const skupine = Array.isArray(dogodek.skupine) ? (dogodek.skupine as string[]) : []
  if (skupine.length) {
    const res = await payload.find({
      collection: 'users',
      where: { vloga: { in: skupine } },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    for (const u of res.docs as { email?: string }[]) if (u.email) emails.add(String(u.email))
  }

  const seznam = [...emails]
  if (!seznam.length) {
    return NextResponse.json(
      { ok: false, error: 'Ni prejemnikov – dodaj skupine ali posameznike z e-naslovom.' },
      { status: 400 },
    )
  }

  // Sestavi vabilo.
  const tip = DOGODEK_TIPI.find((t) => t.value === dogodek.tip)?.label || 'Dogodek'
  const kdaj = dogodek.zacetek
    ? new Date(dogodek.zacetek as string).toLocaleString('sl-SI', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Ljubljana',
      })
    : ''
  const html = `
    <p>Pozdravljeni,</p>
    <p>vabljeni ste na <strong>${esc(dogodek.naslov)}</strong> (${esc(tip)}).</p>
    <ul>
      ${kdaj ? `<li><strong>Kdaj:</strong> ${esc(kdaj)}</li>` : ''}
      ${dogodek.lokacija ? `<li><strong>Kje:</strong> ${esc(dogodek.lokacija)}</li>` : ''}
    </ul>
    ${dogodek.opis ? `<p>${esc(dogodek.opis).replace(/\n/g, '<br/>')}</p>` : ''}
    <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
  `
  const subject = `Vabilo: ${dogodek.naslov}`

  let sent = 0
  for (const to of seznam) {
    try {
      await payload.sendEmail({ to, subject, html })
      sent++
    } catch (e) {
      console.error('Vabilo ni bilo poslano:', to, e)
    }
  }

  return NextResponse.json({ ok: true, sent, total: seznam.length })
}
