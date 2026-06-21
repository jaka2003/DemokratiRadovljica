import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Kontaktni obrazec na strani kandidata (spec. razdelek 6).
export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Neveljavna zahteva.' }, { status: 400 })
  }
  const g = (k: string) => String(form.get(k) ?? '').trim()
  const imePriimek = g('imePriimek')
  const email = g('email')
  const telefon = g('telefon')
  const sporocilo = g('sporocilo')
  const soglasje = form.get('soglasjeGDPR') === 'true' || form.get('soglasjeGDPR') === 'on'

  if (!imePriimek) return NextResponse.json({ ok: false, error: 'Vnesi ime in priimek.' }, { status: 400 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ ok: false, error: 'Vnesi veljaven e-naslov.' }, { status: 400 })
  if (!sporocilo || sporocilo.length < 5)
    return NextResponse.json({ ok: false, error: 'Vnesi sporočilo.' }, { status: 400 })
  if (!soglasje)
    return NextResponse.json({ ok: false, error: 'Potrebno je soglasje za obdelavo podatkov.' }, { status: 400 })

  const payload = await getPayload({ config })
  try {
    await payload.create({
      collection: 'kontakt-sporocila',
      data: { imePriimek, email, telefon, sporocilo, vir: 'kandidat', soglasjeGDPR: true },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Napaka pri shranjevanju sporočila:', e)
    return NextResponse.json({ ok: false, error: 'Sporočila ni bilo mogoče shraniti.' }, { status: 500 })
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM
  if (adminEmail) {
    try {
      await payload.sendEmail({
        to: adminEmail,
        subject: `Novo sporočilo (kandidat): ${imePriimek}`,
        html: `<p>${imePriimek} (${email}${telefon ? ', ' + telefon : ''}):</p><p>${sporocilo}</p>`,
      })
    } catch {}
  }

  return NextResponse.json({ ok: true })
}
