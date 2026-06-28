import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jeSpam } from '@/lib/spam'
import { SPOL_OPCIJE, POSTA_OPCIJE, IZOBRAZBA_OPCIJE, vrednosti } from '@/lib/pristop'

function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

const SPOLI = vrednosti(SPOL_OPCIJE)
const POSTE = vrednosti(POSTA_OPCIJE)
const IZOBRAZBE = vrednosti(IZOBRAZBA_OPCIJE)

// Oddaja pristopne izjave (včlanitev).
export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return err('Neveljavna zahteva.')
  }
  const get = (k: string) => String(form.get(k) ?? '').trim()
  if (jeSpam(form)) return NextResponse.json({ ok: true }) // honeypot

  const imePriimek = get('imePriimek')
  const datumRojstva = get('datumRojstva')
  const spol = get('spol')
  const email = get('email')
  const stalniNaslov = get('stalniNaslov')
  const stalnoMesto = get('stalnoMesto')
  const stalnaPosta = get('stalnaPosta')
  const postaNa = get('postaNa')
  const poklic = get('poklic')
  const delovnoMesto = get('delovnoMesto')
  const podjetje = get('podjetje')
  const izobrazba = get('izobrazba')
  const soglasje = form.get('soglasjeGDPR') === 'true' || form.get('soglasjeGDPR') === 'on'

  // --- Validacija obveznih polj ---
  if (!imePriimek || imePriimek.length < 3) return err('Vnesi ime in priimek.')
  if (!datumRojstva) return err('Vnesi datum rojstva.')
  if (!SPOLI.includes(spol)) return err('Izberi spol.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Vnesi veljaven e-poštni naslov.')
  if (!stalniNaslov) return err('Vnesi stalno prebivališče.')
  if (!stalnoMesto) return err('Vnesi mesto stalnega prebivališča.')
  if (!stalnaPosta) return err('Vnesi poštno številko.')
  if (!POSTE.includes(postaNa)) return err('Izberi, kam želiš prejemati pošto.')
  if (!poklic) return err('Vnesi poklic.')
  if (!delovnoMesto) return err('Vnesi delovno mesto.')
  if (!podjetje) return err('Vnesi podjetje.')
  if (izobrazba && !IZOBRAZBE.includes(izobrazba)) return err('Neveljavna izobrazba.')
  if (!soglasje) return err('Za oddajo je potrebno soglasje za obdelavo osebnih podatkov.')

  const payload = await getPayload({ config })

  let id: string | number
  try {
    const doc = await payload.create({
      collection: 'pristopne-izjave',
      data: {
        imePriimek,
        datumRojstva,
        spol: spol as never,
        email,
        mobilniTelefon: get('mobilniTelefon') || undefined,
        telefon: get('telefon') || undefined,
        stalniNaslov,
        stalnoMesto,
        stalnaPosta,
        zacasniNaslov: get('zacasniNaslov') || undefined,
        zacasnoMesto: get('zacasnoMesto') || undefined,
        zacasnaPosta: get('zacasnaPosta') || undefined,
        postaNa: postaNa as never,
        poklic,
        delovnoMesto,
        podjetje,
        sedezZaposlitve: get('sedezZaposlitve') || undefined,
        izobrazba: (izobrazba || undefined) as never,
        soglasjeGDPR: true,
        status: 'novo',
      },
      overrideAccess: true,
    })
    id = doc.id
  } catch (e) {
    console.error('Napaka pri shranjevanju pristopne izjave:', e)
    return err('Izjave ni bilo mogoče shraniti. Poskusi znova.', 500)
  }

  // E-pošta: potrditev prijavitelju + obvestilo ekipi.
  try {
    await payload.sendEmail({
      to: email,
      subject: 'Prejeli smo tvojo pristopno izjavo – Demokrati Radovljica',
      html: `
        <p>Pozdravljen/-a, ${imePriimek},</p>
        <p>hvala za oddano pristopno izjavo. Tvojo prošnjo za včlanitev bomo pregledali in te obvestili.</p>
        <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
      `,
    })
  } catch (e) {
    console.error('Potrditveni e-mail ni bil poslan:', e)
  }
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM
  if (adminEmail) {
    try {
      await payload.sendEmail({
        to: adminEmail,
        subject: `Nova pristopna izjava: ${imePriimek}`,
        html: `
          <p>Prejeta je nova pristopna izjava (včlanitev):</p>
          <ul>
            <li><strong>Ime:</strong> ${imePriimek}</li>
            <li><strong>E-naslov:</strong> ${email}</li>
            <li><strong>Kraj:</strong> ${stalnoMesto}</li>
          </ul>
          <p>Odpri v administraciji: <a href="${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin/collections/pristopne-izjave/${id}">pregled izjave</a></p>
        `,
      })
    } catch (e) {
      console.error('Admin obvestilo ni bilo poslano:', e)
    }
  }

  return NextResponse.json({ ok: true, id })
}
