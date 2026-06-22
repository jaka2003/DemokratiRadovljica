import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

// Povabi novega uporabnika: admin vnese le e-naslov (in ime). Ustvarimo račun brez
// znanega gesla in pošljemo povezavo, kjer si uporabnik sam nastavi geslo in dopolni profil.
// Vlogo nato določi administrator.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return err('Dostop zavrnjen.', 403)

  const body = await req.json().catch(() => ({}))
  const email = String(body?.email ?? '').trim().toLowerCase()
  const ime = String(body?.ime ?? '').trim()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Vnesi veljaven e-poštni naslov.')

  const obstoj = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (obstoj.totalDocs > 0) return err('Uporabnik s tem e-naslovom že obstaja.')

  // Ustvari račun z naključnim (neznanim) geslom – uporabnik si ga nastavi prek povezave.
  try {
    await payload.create({
      collection: 'users',
      data: {
        email,
        ime: ime || undefined,
        password: randomBytes(24).toString('hex'),
        vloga: ['neclan'], // začasno; administrator določi pravo vlogo pozneje
      },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Napaka pri ustvarjanju uporabnika:', e)
    return err('Uporabnika ni bilo mogoče ustvariti.', 500)
  }

  // Token za nastavitev gesla (brez Payloadove privzete e-pošte – pošljemo svoje vabilo).
  let token: string | undefined
  try {
    token = (await payload.forgotPassword({
      collection: 'users',
      data: { email },
      disableEmail: true,
    })) as unknown as string
  } catch (e) {
    console.error('Napaka pri pripravi povezave:', e)
  }
  if (!token) return err('Račun je ustvarjen, povezave za geslo pa ni bilo mogoče pripraviti.', 500)

  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const link = `${base}/admin/reset/${token}`
  const pozdrav = ime ? `Pozdravljen/-a, ${esc(ime)},` : 'Pozdravljen/-a,'

  try {
    await payload.sendEmail({
      to: email,
      subject: 'Vabilo v sistem – Demokrati Radovljica',
      html: `
        <p>${pozdrav}</p>
        <p>dodani ste bili v sistem <strong>Demokrati Radovljica</strong>. Za začetek nastavite svoje geslo in dopolnite profil:</p>
        <p><a href="${link}" style="display:inline-block;background:#00bbc1;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Nastavi geslo</a></p>
        <p>Po prijavi v svojem profilu izpolnite osebne podatke. Vlogo (kategorijo) vam določi administrator.</p>
        <p style="font-size:12px;color:#888">Če gumb ne deluje, odprite povezavo: ${link}</p>
        <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
      `,
    })
  } catch (e) {
    console.error('Vabilo ni bilo poslano:', e)
    return err('Račun je ustvarjen, e-pošte pa ni bilo mogoče poslati. Preveri nastavitve SMTP.', 500)
  }

  return NextResponse.json({ ok: true })
}
