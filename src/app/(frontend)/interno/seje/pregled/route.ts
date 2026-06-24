import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { resolveUdelezenci, morebitenZakljucek } from '@/lib/seje-server'
import { izracunajRezultat } from '@/lib/seje'

// Pregled rezultatov seje za administracijo (kdo je glasoval, izidi po točkah).
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, error: 'Manjka id seje.' }, { status: 400 })

  let seja: Record<string, unknown>
  try {
    seja = (await payload.findByID({ collection: 'seje', id, depth: 0, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    return NextResponse.json({ ok: false, error: 'Seja ni najdena.' }, { status: 404 })
  }

  const udelezenci = await resolveUdelezenci(payload, seja)
  const status = await morebitenZakljucek(payload, seja, udelezenci)

  const glasoviRes = await payload.find({
    collection: 'glasovi',
    where: { seja: { equals: id } },
    limit: 5000,
    depth: 0,
    overrideAccess: true,
  })
  const glasovi = glasoviRes.docs as { tockaId: string; uporabnik: unknown; glas: string }[]
  const uid = (g: { uporabnik: unknown }) =>
    String(g.uporabnik && typeof g.uporabnik === 'object' ? (g.uporabnik as { id: unknown }).id : g.uporabnik)

  const tockeSrc = (Array.isArray(seja.tocke) ? seja.tocke : []) as { id: string; naslov: string }[]
  const tocke = tockeSrc.map((t) => {
    const gt = glasovi.filter((g) => String(g.tockaId) === String(t.id))
    const r = izracunajRezultat(gt, udelezenci.length)
    const glasovaliIds = new Set(gt.map(uid))
    return {
      id: t.id,
      naslov: t.naslov,
      ...r,
      kdoJe: udelezenci.filter((u) => glasovaliIds.has(String(u.id))).map((u) => u.ime),
      kdoNi: udelezenci.filter((u) => !glasovaliIds.has(String(u.id))).map((u) => u.ime),
    }
  })

  return NextResponse.json({
    ok: true,
    status,
    naslov: seja.naslov,
    steviloUdelezencev: udelezenci.length,
    rok: seja.rokGlasovanja || null,
    tocke,
  })
}
