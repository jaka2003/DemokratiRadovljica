import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { sobeZaUporabnika } from '@/lib/klepet'
import { imeUporabnika } from '@/lib/klepet-server'

// Pregled za stransko vrstico klepeta: sobe (z zadnjim sporočilom), zasebni pogovori in
// seznam uporabnikov za nov pogovor. Uporablja se tudi za značko neprebranih v meniju.
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })

  const admin = isAdmin(user)
  const sobeSeznam = sobeZaUporabnika((user as { vloga?: unknown }).vloga, admin)

  // Zadnje sporočilo za vsako sobo.
  const sobe = await Promise.all(
    sobeSeznam.map(async (s) => {
      const r = await payload.find({
        collection: 'sporocila',
        where: { and: [{ vrsta: { equals: 'soba' } }, { soba: { equals: s.kljuc } }] },
        sort: '-createdAt',
        limit: 1,
        depth: 1,
        overrideAccess: true,
      })
      const z = r.docs[0] as Record<string, unknown> | undefined
      return {
        kljuc: s.kljuc,
        naziv: s.naziv,
        ikona: s.ikona,
        opis: s.opis,
        zadnjiId: z ? Number(z.id) : 0,
        zadnjeBesedilo: z ? String(z.besedilo || '') : '',
        zadnjiCas: z ? String(z.createdAt || '') : '',
        zadnjiAvtor: z ? imeUporabnika(z.avtor as Record<string, unknown>) : '',
      }
    }),
  )

  // Zasebni pogovori, v katerih nastopa uporabnik (najnovejše sporočilo na pogovor).
  const dmRes = await payload.find({
    collection: 'sporocila',
    where: {
      and: [
        { vrsta: { equals: 'zasebno' } },
        { or: [{ avtor: { equals: user.id } }, { prejemnik: { equals: user.id } }] },
      ],
    },
    sort: '-createdAt',
    limit: 400,
    depth: 1,
    overrideAccess: true,
  })
  const pogovoriMap = new Map<string, Record<string, unknown>>()
  for (const m of dmRes.docs as Record<string, unknown>[]) {
    const avtor = m.avtor as Record<string, unknown> | string | number
    const prejemnik = m.prejemnik as Record<string, unknown> | string | number | null
    const avtorId = avtor && typeof avtor === 'object' ? (avtor as { id: unknown }).id : avtor
    const prejId = prejemnik && typeof prejemnik === 'object' ? (prejemnik as { id: unknown }).id : prejemnik
    const jaz = String(avtorId) === String(user.id)
    const drugiId = jaz ? prejId : avtorId
    const drugiUser = jaz ? prejemnik : avtor
    if (drugiId == null) continue
    const k = String(drugiId)
    if (pogovoriMap.has(k)) continue // prvi (najnovejši) zmaga
    pogovoriMap.set(k, {
      uporabnikId: Number(drugiId),
      ime: imeUporabnika(drugiUser as Record<string, unknown>),
      zadnjiId: Number(m.id),
      zadnjeBesedilo: String(m.besedilo || ''),
      zadnjiCas: String(m.createdAt || ''),
      odMene: jaz,
    })
  }
  const pogovori = [...pogovoriMap.values()]

  // Seznam aktivnih uporabnikov za nov pogovor (brez sebe).
  const uRes = await payload.find({
    collection: 'users',
    where: { id: { not_equals: user.id } },
    sort: 'ime',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const uporabniki = (uRes.docs as Record<string, unknown>[])
    .filter((u) => (u as { aktiven?: boolean }).aktiven !== false)
    .map((u) => ({
      id: Number(u.id),
      ime: imeUporabnika(u),
      vloge: Array.isArray(u.vloga) ? (u.vloga as string[]) : u.vloga ? [String(u.vloga)] : [],
    }))

  return NextResponse.json({
    ok: true,
    jaz: { id: Number(user.id), ime: imeUporabnika(user as unknown as Record<string, unknown>) },
    admin,
    sobe,
    pogovori,
    uporabniki,
  })
}
