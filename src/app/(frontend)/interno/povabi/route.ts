import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

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

  // Ustvari račun z naključnim (neznanim) geslom. Pozdravno e-pošto s povezavo za nastavitev
  // gesla pošlje afterChange hook na uporabniku (velja za vsak način ustvarjanja).
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

  return NextResponse.json({ ok: true })
}
