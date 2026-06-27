import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

// Prenese prijavo za sodelovanje v uporabnika sistema in prijavo označi kot zaključeno.
// Ustvarjenje uporabnika sproži samodejno pozdravno e-pošto (povezava za nastavitev gesla).
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const prijavaId = (await req.json().catch(() => ({})))?.prijavaId
  if (!prijavaId) return NextResponse.json({ ok: false, error: 'Manjka prijava.' }, { status: 400 })

  let p: Record<string, unknown>
  try {
    p = (await payload.findByID({ collection: 'prostovoljci', id: prijavaId, depth: 0, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    return NextResponse.json({ ok: false, error: 'Prijava ni najdena.' }, { status: 404 })
  }

  const email = String(p.email || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ ok: false, error: 'Prijava nima e-naslova.' }, { status: 400 })

  const zakljuci = async () => {
    try {
      await payload.update({ collection: 'prostovoljci', id: prijavaId, data: { status: 'zakljuceno' }, overrideAccess: true })
    } catch {
      /* neusodno */
    }
  }

  // Če uporabnik s tem e-naslovom že obstaja, ga ne podvajamo – le označimo prijavo.
  const obstoj = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (obstoj.totalDocs > 0) {
    await zakljuci()
    return NextResponse.json({ ok: true, userId: (obstoj.docs[0] as { id: string | number }).id, ze: true })
  }

  let created: { id: string | number }
  try {
    created = (await payload.create({
      collection: 'users',
      data: {
        email,
        ime: (p.imePriimek as string) || undefined,
        telefon: (p.telefon as string) || undefined,
        naslovKraj: (p.kraj as string) || undefined,
        podrocjaSodelovanja: (p.podrocja as string) || undefined,
        password: randomBytes(24).toString('hex'),
        vloga: ['neclan'], // začasno; administrator določi pravo vlogo
      },
      overrideAccess: true,
    })) as { id: string | number }
  } catch (e) {
    console.error('Napaka pri prenosu prijave v uporabnika:', e)
    return NextResponse.json({ ok: false, error: 'Uporabnika ni bilo mogoče ustvariti.' }, { status: 500 })
  }

  await zakljuci()
  return NextResponse.json({ ok: true, userId: created.id })
}
