import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jeSpam } from '@/lib/spam'

// Prijava za sodelovanje (spec. razdelek 4).
export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Neveljavna zahteva.' }, { status: 400 })
  }
  const g = (k: string) => String(form.get(k) ?? '').trim()
  if (jeSpam(form)) return NextResponse.json({ ok: true }) // honeypot: tiha zavrnitev

  const imePriimek = g('imePriimek')
  const email = g('email')
  const telefon = g('telefon')
  const kraj = g('kraj')
  const podrocja = g('podrocja')
  const sporocilo = g('sporocilo')
  const soglasje = form.get('soglasjeGDPR') === 'true' || form.get('soglasjeGDPR') === 'on'

  if (!imePriimek) return NextResponse.json({ ok: false, error: 'Vnesi ime in priimek.' }, { status: 400 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ ok: false, error: 'Vnesi veljaven e-naslov.' }, { status: 400 })
  if (!soglasje)
    return NextResponse.json({ ok: false, error: 'Potrebno je soglasje za obdelavo podatkov.' }, { status: 400 })

  const payload = await getPayload({ config })
  try {
    await payload.create({
      collection: 'prostovoljci',
      data: { imePriimek, email, telefon, kraj, podrocja, sporocilo, soglasjeGDPR: true },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Napaka pri prijavi prostovoljca:', e)
    return NextResponse.json({ ok: false, error: 'Prijave ni bilo mogoče shraniti.' }, { status: 500 })
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM
  try {
    await payload.sendEmail({
      to: email,
      subject: 'Hvala za prijavo – Demokrati Radovljica',
      html: `<p>Pozdravljeni,</p><p>hvala za zanimanje za sodelovanje z Demokrati Radovljica. Kmalu se vam oglasimo.</p><p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>`,
    })
  } catch {}
  if (adminEmail) {
    try {
      await payload.sendEmail({
        to: adminEmail,
        subject: `Nova prijava za sodelovanje: ${imePriimek}`,
        html: `<p>${imePriimek} (${email}${telefon ? ', ' + telefon : ''})${kraj ? ', ' + kraj : ''} se želi pridružiti.</p><p>Področja: ${podrocja || '—'}</p><p>${sporocilo || ''}</p>`,
      })
    } catch {}
  }

  return NextResponse.json({ ok: true })
}
