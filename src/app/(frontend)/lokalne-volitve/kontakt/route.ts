import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jeSpam } from '@/lib/spam'

// Sporočila kandidatom (župan ali svetnik) s strani Lokalne volitve.
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
  const sporocilo = g('sporocilo')
  const vir = g('vir') === 'svetnik' ? 'svetnik' : 'kandidat'
  const prejemnik = g('prejemnik')
  const svetnikEmail = g('svetnikEmail')
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
      data: { imePriimek, email, telefon, sporocilo, vir, prejemnik, soglasjeGDPR: true },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Napaka pri shranjevanju sporočila:', e)
    return NextResponse.json({ ok: false, error: 'Sporočila ni bilo mogoče shraniti.' }, { status: 500 })
  }

  const naslovljeno = prejemnik ? ` (za: ${prejemnik})` : ''
  const html = `<p>${imePriimek} (${email}${telefon ? ', ' + telefon : ''})${naslovljeno}:</p><p>${sporocilo}</p>`

  // Obvestilo administratorju + po želji kandidatu (svetniku).
  const prejemniki = [process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM]
  if (vir === 'svetnik' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(svetnikEmail)) prejemniki.push(svetnikEmail)
  for (const to of prejemniki.filter(Boolean)) {
    try {
      await payload.sendEmail({ to: to as string, subject: `Novo sporočilo${naslovljeno}: ${imePriimek}`, html })
    } catch {}
  }

  return NextResponse.json({ ok: true })
}
