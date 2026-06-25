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
    prostovoljci,
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
    count('prostovoljci'),
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
  const [zadnjiKandidati, zadnjePobude, zadnjaSporocila, cakajoceNaloge, prihajajociDogodki] = await Promise.all([
    list('users', { vloga: { in: [...KANDIDAT_VLOGE] } }, '-createdAt'),
    list('pobude', undefined, '-createdAt'),
    list('kontakt-sporocila', undefined, '-createdAt'),
    list('naloge', { status: { not_equals: 'zakljucena' } }, '-createdAt'),
    list('dogodki', { and: [{ zacetek: { greater_than_equal: zdaj } }, { status: { not_equals: 'preklicano' } }] }, 'zacetek'),
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
      prostovoljci,
      sporocila,
    },
    seznami: {
      zadnjiKandidati: zadnjiKandidati.map((d) => ({ ime: d.ime || d.email, kraj: d.naslovKraj || '' })),
      zadnjePobude: zadnjePobude.map((d) => ({ naslov: d.naslov, kraj: d.kraj, status: d.status })),
      zadnjaSporocila: zadnjaSporocila.map((d) => ({ ime: d.imePriimek, vir: d.vir })),
      cakajoceNaloge: cakajoceNaloge.map((d) => ({ naslov: d.naslov, status: d.status })),
      prihajajociDogodki: prihajajociDogodki.map((d) => ({ naslov: d.naslov, zacetek: d.zacetek, lokacija: d.lokacija || '' })),
    },
  })
}
