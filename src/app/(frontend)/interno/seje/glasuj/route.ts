import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { resolveUdelezenci, morebitenZakljucek } from '@/lib/seje-server'

// Oddaja glasu za eno točko dnevnega reda. Samo prijavljeni udeleženci, en glas na točko.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const sejaId = body?.sejaId
  const tockaId = String(body?.tockaId || '')
  const glas = body?.glas
  if (!sejaId || !tockaId || !['za', 'proti', 'vzdrzan'].includes(glas)) {
    return NextResponse.json({ ok: false, error: 'Neveljavni podatki.' }, { status: 400 })
  }

  let seja: Record<string, unknown>
  try {
    seja = (await payload.findByID({ collection: 'seje', id: sejaId, depth: 0, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    return NextResponse.json({ ok: false, error: 'Seja ni najdena.' }, { status: 404 })
  }

  if (seja.status !== 'v_teku') {
    return NextResponse.json({ ok: false, error: 'Glasovanje za to sejo ni odprto.' }, { status: 400 })
  }
  if (seja.rokGlasovanja && Date.now() > new Date(seja.rokGlasovanja as string).getTime()) {
    return NextResponse.json({ ok: false, error: 'Rok za glasovanje je potekel.' }, { status: 400 })
  }

  const udelezenci = await resolveUdelezenci(payload, seja)
  if (!udelezenci.some((u) => String(u.id) === String(user.id))) {
    return NextResponse.json({ ok: false, error: 'Niste med udeleženci te seje.' }, { status: 403 })
  }

  const tocke = (Array.isArray(seja.tocke) ? seja.tocke : []) as { id: string }[]
  if (!tocke.some((t) => String(t.id) === tockaId)) {
    return NextResponse.json({ ok: false, error: 'Neveljavna točka.' }, { status: 400 })
  }

  const obstoj = await payload.count({
    collection: 'glasovi',
    where: {
      and: [{ seja: { equals: sejaId } }, { tockaId: { equals: tockaId } }, { uporabnik: { equals: user.id } }],
    },
  })
  if (obstoj.totalDocs > 0) {
    return NextResponse.json({ ok: false, error: 'O tej točki ste že glasovali.' }, { status: 409 })
  }

  try {
    await payload.create({
      collection: 'glasovi',
      data: { seja: sejaId, tockaId, uporabnik: user.id, glas, glasovanoOb: new Date().toISOString() },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Napaka pri shranjevanju glasu:', e)
    return NextResponse.json({ ok: false, error: 'Glasu ni bilo mogoče shraniti.' }, { status: 500 })
  }

  const status = await morebitenZakljucek(payload, seja, udelezenci)
  return NextResponse.json({ ok: true, status })
}
