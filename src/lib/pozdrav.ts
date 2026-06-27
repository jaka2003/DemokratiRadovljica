import type { Payload } from 'payload'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

// Pošlje pozdravno e-pošto s povezavo za nastavitev gesla in dopolnitev profila ter označi,
// da je bila poslana (polje »pozdravPoslanOb«). Vrne čas pošiljanja (ISO).
export async function posljiPozdrav(payload: Payload, userId: string | number): Promise<string> {
  const u = (await payload.findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true })) as {
    email?: string
    ime?: string
  }
  if (!u?.email) throw new Error('Uporabnik nima e-naslova.')

  const token = (await payload.forgotPassword({
    collection: 'users',
    data: { email: u.email },
    disableEmail: true,
  })) as unknown as string

  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const link = `${base}/admin/reset/${token}`
  const pozdrav = u.ime ? `Pozdravljen/-a, ${esc(u.ime)},` : 'Pozdravljen/-a,'

  await payload.sendEmail({
    to: u.email,
    subject: 'Dobrodošli – Demokrati Radovljica',
    html: `
      <p>${pozdrav}</p>
      <p>vaš račun v sistemu <strong>Demokrati Radovljica</strong> je pripravljen. Za začetek nastavite geslo in dopolnite svoj profil:</p>
      <p><a href="${link}" style="display:inline-block;background:#00bbc1;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Nastavi geslo</a></p>
      <p>Po prijavi v profilu izpolnite osebne podatke. Vlogo (kategorijo) vam določi administrator.</p>
      <p style="font-size:12px;color:#888">Če gumb ne deluje, odprite povezavo: ${link}</p>
      <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
    `,
  })

  const poslanoOb = new Date().toISOString()
  await payload.update({
    collection: 'users',
    id: userId,
    data: { pozdravPoslanOb: poslanoOb },
    overrideAccess: true,
  })
  return poslanoOb
}
