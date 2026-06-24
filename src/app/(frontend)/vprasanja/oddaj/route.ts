import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jeSpam } from '@/lib/spam'

function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

// Oddaja vprašanja občana. Honeypot zaščita, minimalni osebni podatki, e-naslov je neobvezen.
export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return err('Neveljavna zahteva.')
  }

  const get = (k: string) => String(form.get(k) ?? '').trim()
  if (jeSpam(form)) return NextResponse.json({ ok: true }) // honeypot: tiha zavrnitev

  const vprasanje = get('vprasanje')
  const imeObcana = get('imeObcana')
  const email = get('email')
  const prikaziIme = form.get('prikaziIme') === 'true' || form.get('prikaziIme') === 'on'
  const soglasje = form.get('soglasjeGDPR') === 'true' || form.get('soglasjeGDPR') === 'on'

  // --- Validacija ---
  if (!vprasanje || vprasanje.length < 10) return err('Vprašanje naj ima vsaj 10 znakov.')
  if (vprasanje.length > 2000) return err('Vprašanje je predolgo (največ 2000 znakov).')
  if (email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Vnesi veljaven e-poštni naslov (ali ga pusti prazno).')
    if (!soglasje) return err('Za obvestilo na e-naslov je potrebno soglasje za obdelavo podatkov.')
  }

  const payload = await getPayload({ config })

  let vprasanjeId: string | number
  try {
    const ustvarjeno = await payload.create({
      collection: 'vprasanja',
      data: {
        vprasanje,
        imeObcana: imeObcana || undefined,
        prikaziIme,
        email: email || undefined,
        soglasjeGDPR: Boolean(email && soglasje),
        status: 'novo',
        objavljeno: false,
      },
      overrideAccess: true,
    })
    vprasanjeId = ustvarjeno.id
  } catch (e) {
    console.error('Napaka pri shranjevanju vprašanja:', e)
    return err('Vprašanja ni bilo mogoče shraniti. Poskusi znova.', 500)
  }

  // --- E-pošta: potrditev občanu (če je pustil e-naslov) + obvestilo ekipi ---
  if (email) {
    try {
      await payload.sendEmail({
        to: email,
        subject: 'Prejeli smo vaše vprašanje – Demokrati Radovljica',
        html: `
          <p>Pozdravljeni,</p>
          <p>hvala za vaše vprašanje. Ekipa ga bo pregledala in pripravila odgovor.</p>
          <p>Ko bo odgovor objavljen, vas obvestimo na ta e-naslov.</p>
          <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
        `,
      })
    } catch (e) {
      console.error('Potrditveni e-mail ni bil poslan:', e)
    }
  }
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM
  if (adminEmail) {
    try {
      await payload.sendEmail({
        to: adminEmail,
        subject: 'Novo vprašanje občana',
        html: `
          <p>Prejeto je novo vprašanje občana:</p>
          <blockquote style="border-left:3px solid #00bbc1;padding-left:12px;color:#333">${vprasanje.replace(/</g, '&lt;')}</blockquote>
          <p>${imeObcana ? 'Ime: ' + imeObcana.replace(/</g, '&lt;') + '<br/>' : ''}${email ? 'E-naslov: ' + email : 'Brez e-naslova'}</p>
          <p>Odpri v administraciji: <a href="${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin/collections/vprasanja/${vprasanjeId}">pregled vprašanja</a></p>
        `,
      })
    } catch (e) {
      console.error('Admin obvestilo ni bilo poslano:', e)
    }
  }

  return NextResponse.json({ ok: true, id: vprasanjeId })
}
