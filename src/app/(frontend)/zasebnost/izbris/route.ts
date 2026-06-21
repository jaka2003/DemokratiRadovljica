import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Zahteva za izbris / vpogled v osebne podatke (GDPR, spec. razdelek 13).
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
  const zahteva = g('sporocilo')
  const soglasje = form.get('soglasjeGDPR') === 'true' || form.get('soglasjeGDPR') === 'on'

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ ok: false, error: 'Vnesi veljaven e-naslov.' }, { status: 400 })
  if (!soglasje)
    return NextResponse.json({ ok: false, error: 'Potrdi zahtevo.' }, { status: 400 })

  const payload = await getPayload({ config })
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM
  try {
    await payload.sendEmail({
      to: adminEmail || email,
      subject: `GDPR zahteva za izbris/vpogled: ${imePriimek || email}`,
      html: `<p>Prejeta je GDPR zahteva.</p><ul><li>Ime: ${imePriimek || '—'}</li><li>E-pošta: ${email}</li></ul><p>${zahteva || ''}</p>`,
    })
  } catch (e) {
    console.error('GDPR zahteva – e-pošta ni bila poslana:', e)
  }

  return NextResponse.json({ ok: true })
}
