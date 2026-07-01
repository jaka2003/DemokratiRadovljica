import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin, KANDIDAT_VLOGE } from '@/access/roles'

// Statistika za administrativno nadzorno ploščo (spec. razdelek 11).
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false }, { status: 403 })

  const count = async (collection: string, where?: Record<string, unknown>) =>
    (await payload.count({ collection: collection as never, where: where as never, overrideAccess: true })).totalDocs

  const kand = { vloga: { in: [...KANDIDAT_VLOGE] } }
  const [
    kandidati,
    profilDokoncan,
    brezDokumentov,
    kandidatiBrezFoto,
    kandidatiBrezOpisa,
    novePobude,
    odprtePobude,
    neodgovorjenaVprasanja,
    pristopneIzjave,
    sporocila,
  ] = await Promise.all([
    count('users', kand),
    count('users', { and: [kand, { statusProfila: { equals: 'potrjen' } }] }),
    count('users', { and: [kand, { statusDokumentacije: { equals: 'ni_oddano' } }] }),
    count('users', { and: [kand, { fotografija: { exists: false } }] }),
    count('users', { and: [kand, { opis: { exists: false } }] }),
    count('pobude', { status: { equals: 'nova' } }),
    count('pobude', { status: { in: ['nova', 'v_pregledu', 'ogled_terena'] } }),
    count('vprasanja', { status: { in: ['novo', 'v_obravnavi'] } }),
    count('pristopne-izjave'),
    count('kontakt-sporocila'),
  ])

  // Seznami (zadnje prijave, aktivnosti, sporočila, čakajoče naloge).
  const list = async (collection: string, where: Record<string, unknown> | undefined, sort: string) =>
    (
      await payload.find({
        collection: collection as never,
        where: where as never,
        sort,
        limit: 5,
        depth: 0,
        overrideAccess: true,
      })
    ).docs as Record<string, unknown>[]

  const zdaj = new Date().toISOString()
  // »Ta teden«: od začetka današnjega dne do čez 7 dni (vključno z današnjim rokom/dogodkom).
  const danZac = new Date()
  danZac.setHours(0, 0, 0, 0)
  const tedenSpodnja = danZac.toISOString()
  const tedenZgornja = new Date(danZac.getTime() + 8 * 864e5).toISOString()

  const [zadnjiKandidati, zadnjePobude, zadnjaSporocila, cakajoceNaloge, prihajajociDogodki, tedenDogodki, tedenNaloge] =
    await Promise.all([
      list('users', { vloga: { in: [...KANDIDAT_VLOGE] } }, '-createdAt'),
      list('pobude', undefined, '-createdAt'),
      list('kontakt-sporocila', undefined, '-createdAt'),
      list('naloge', { status: { not_equals: 'zakljucena' } }, '-createdAt'),
      list('dogodki', { and: [{ zacetek: { greater_than_equal: zdaj } }, { status: { not_equals: 'preklicano' } }] }, 'zacetek'),
      payload.find({
        collection: 'dogodki',
        where: { and: [{ zacetek: { greater_than_equal: tedenSpodnja } }, { zacetek: { less_than: tedenZgornja } }, { status: { not_equals: 'preklicano' } }] },
        sort: 'zacetek',
        limit: 25,
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'naloge',
        where: { and: [{ rok: { greater_than_equal: tedenSpodnja } }, { rok: { less_than: tedenZgornja } }, { status: { not_equals: 'zakljucena' } }] },
        sort: 'rok',
        limit: 25,
        depth: 1,
        overrideAccess: true,
      }),
    ])

  return NextResponse.json({
    ok: true,
    stats: {
      kandidati,
      profilDokoncan,
      brezDokumentov,
      kandidatiBrezFoto,
      kandidatiBrezOpisa,
      novePobude,
      odprtePobude,
      neodgovorjenaVprasanja,
      pristopneIzjave,
      sporocila,
    },
    seznami: {
      zadnjiKandidati: zadnjiKandidati.map((d) => ({ ime: d.ime || d.email, kraj: d.naslovKraj || '' })),
      zadnjePobude: zadnjePobude.map((d) => ({ naslov: d.naslov, kraj: d.kraj, status: d.status })),
      zadnjaSporocila: zadnjaSporocila.map((d) => ({ ime: d.imePriimek, vir: d.vir })),
      cakajoceNaloge: cakajoceNaloge.map((d) => ({ naslov: d.naslov, status: d.status })),
      prihajajociDogodki: prihajajociDogodki.map((d) => ({ naslov: d.naslov, zacetek: d.zacetek, lokacija: d.lokacija || '' })),
    },
    taTeden: {
      dogodki: tedenDogodki.docs.map((d) => ({ naslov: d.naslov, zacetek: d.zacetek, lokacija: d.lokacija || '' })),
      // Isto nalogo (isti naslov) dodeljeno več osebam prikažemo enkrat, s številom oseb.
      naloge: (() => {
        const m = new Map<string, { naslov: string; rok: string; stevilo: number; oseba: string }>()
        for (const d of tedenNaloge.docs as Record<string, unknown>[]) {
          const naslov = String(d.naslov || '(brez naslova)').trim()
          const key = naslov.toLowerCase()
          const k = d.kandidat as { ime?: string; email?: string } | null
          const oseba = (k && typeof k === 'object' && (k.ime || k.email)) || ''
          const obst = m.get(key)
          if (obst) obst.stevilo++
          else m.set(key, { naslov, rok: (d.rok as string) || '', stevilo: 1, oseba })
        }
        return Array.from(m.values())
      })(),
    },
  })
}
