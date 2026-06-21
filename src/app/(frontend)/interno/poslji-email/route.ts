import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

// Pošiljanje e-pošte kandidatom (spec. razdelek 11.2).
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Neveljavna zahteva.' }, { status: 400 })
  }
  const filter = String(form.get('filter') || 'vsi')
  const subject = String(form.get('subject') || '').trim()
  const html = String(form.get('body') || '').trim()
  const test = form.get('test') === 'true'

  if (!subject || !html)
    return NextResponse.json({ ok: false, error: 'Vnesi zadevo in vsebino.' }, { status: 400 })

  // Priloge (datoteke).
  const datoteke = form.getAll('priloge').filter((f): f is File => typeof f === 'object' && 'arrayBuffer' in f && (f as File).size > 0)
  const skupnaVelikost = datoteke.reduce((s, f) => s + f.size, 0)
  if (skupnaVelikost > 15 * 1024 * 1024)
    return NextResponse.json({ ok: false, error: 'Priloge so prevelike (skupaj največ 15 MB).' }, { status: 400 })
  const attachments = await Promise.all(
    datoteke.map(async (f) => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()) })),
  )

  const where: Record<string, unknown> = { vloga: { equals: 'kandidat' } }
  if (filter === 'brez_profila') where.statusProfila = { not_equals: 'potrjen' }
  else if (filter === 'brez_dokumentov') where.statusDokumentacije = { equals: 'ni_oddano' }
  else if (filter.startsWith('kraj:')) where.naslovKraj = { equals: filter.slice(5) }

  // Testno pošiljanje: samo administratorju.
  if (test) {
    try {
      await payload.sendEmail({ to: user!.email, subject: `[TEST] ${subject}`, html, attachments })
      return NextResponse.json({ ok: true, sent: 1, test: true })
    } catch (e) {
      console.error(e)
      return NextResponse.json({ ok: false, error: 'Testno sporočilo ni bilo poslano.' }, { status: 500 })
    }
  }

  const res = await payload.find({ collection: 'users', where: where as never, limit: 1000, depth: 0, overrideAccess: true })
  const prejemniki = res.docs.map((d: Record<string, unknown>) => String(d.email)).filter(Boolean)

  // GDPR: vsako sporočilo vsebuje možnost odjave.
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const noga = `<hr/><p style="font-size:12px;color:#888">To sporočilo ste prejeli kot del kampanje Demokrati Radovljica. Odjavo lahko uredite <a href="${base}/zasebnost">tukaj</a>.</p>`

  let sent = 0
  for (const to of prejemniki) {
    try {
      await payload.sendEmail({ to, subject, html: html + noga, attachments })
      sent++
    } catch (e) {
      console.error('E-pošta ni bila poslana:', to, e)
    }
  }

  // Evidenca poslanih sporočil.
  try {
    await payload.create({
      collection: 'email-dnevnik',
      data: { zadeva: subject, filter, prejemnikov: sent, posiljatelj: user!.email, vsebina: html },
      overrideAccess: true,
    })
  } catch {}

  return NextResponse.json({ ok: true, sent, total: prejemniki.length })
}
