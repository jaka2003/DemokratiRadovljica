import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isKandidat } from '@/access/roles'

// Osebna nadzorna plošča prijavljenega uporabnika (kandidat / član):
// napredek profila, moje naloge, prihajajoči dogodki in zadnje novice.
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })

  // Cel uporabnikov zapis (auth vrne polje, a raje preberemo vse).
  const u = (await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })) as Record<string, unknown>

  const ima = (v: unknown) => (typeof v === 'string' ? v.trim().length > 0 : v != null && v !== false)
  const kandidat = isKandidat(user)

  // --- Napredek profila (onboarding) ---
  const koraki = [
    { kljuc: 'osnovno', label: 'Osnovni podatki in kontakt', done: ima(u.ime) && (ima(u.telefon) || ima(u.osebniEmail)) },
    { kljuc: 'foto', label: 'Fotografija', done: ima(u.fotografija) },
    { kljuc: 'predstavitev', label: 'Kratka predstavitev', done: ima(u.opis) },
    { kljuc: 'podrocja', label: 'Področja sodelovanja', done: ima(u.podrocjaSodelovanja) },
    { kljuc: 'zivljenjepis', label: 'Življenjepis (dokument)', done: ima(u.zivljenjepis) },
    { kljuc: 'dokumentacija', label: 'Zahtevani dokumenti oddani', done: u.statusDokumentacije === 'popolno' },
  ]
  const stevilo = koraki.length
  const opravljeno = koraki.filter((k) => k.done).length
  const odstotek = Math.round((opravljeno / stevilo) * 100)
  const naslednje = koraki.find((k) => !k.done) || null

  // --- Moje naloge (odprte) ---
  const nalogeRes = await payload.find({
    collection: 'naloge',
    where: { and: [{ kandidat: { equals: user.id } }, { status: { not_equals: 'zakljucena' } }] },
    sort: 'rok',
    limit: 12,
    depth: 0,
    overrideAccess: true,
  })
  const naloge = (nalogeRes.docs as Record<string, unknown>[]).map((n) => ({
    naslov: String(n.naslov || ''),
    status: String(n.status || 'odprta'),
    rok: n.rok ? String(n.rok) : '',
  }))

  // --- Prihajajoči dogodki zame (po skupinah/vlogah ali posamično) ---
  const vloge = Array.isArray(u.vloga) ? (u.vloga as string[]) : u.vloga ? [String(u.vloga)] : []
  const zdaj = new Date().toISOString()
  const dogodkiRes = await payload.find({
    collection: 'dogodki',
    where: {
      and: [
        { zacetek: { greater_than_equal: zdaj } },
        { status: { not_equals: 'preklicano' } },
        {
          or: [
            { udelezenci: { in: [user.id] } },
            ...(vloge.length ? [{ skupine: { in: vloge } }] : []),
          ],
        },
      ],
    },
    sort: 'zacetek',
    limit: 6,
    depth: 0,
    overrideAccess: true,
  })
  const dogodki = (dogodkiRes.docs as Record<string, unknown>[]).map((d) => ({
    naslov: String(d.naslov || ''),
    tip: String(d.tip || ''),
    zacetek: d.zacetek ? String(d.zacetek) : '',
    lokacija: String(d.lokacija || ''),
  }))

  // --- Zadnje objavljene novice ---
  let novice: { naslov: string; slug: string }[] = []
  try {
    const novRes = await payload.find({
      collection: 'novice',
      where: { objavljeno: { equals: true } },
      sort: '-createdAt',
      limit: 3,
      depth: 0,
      overrideAccess: true,
    })
    novice = (novRes.docs as Record<string, unknown>[]).map((n) => ({
      naslov: String(n.naslov || ''),
      slug: String(n.slug || ''),
    }))
  } catch {
    /* neusodno */
  }

  return NextResponse.json({
    ok: true,
    jaz: { id: Number(user.id), ime: (u.ime as string) || (u.email as string) || 'Uporabnik' },
    kraj: (u.naslovKraj as string) || '',
    jeKandidat: kandidat,
    onboarding: { odstotek, opravljeno, stevilo, koraki, naslednje },
    naloge,
    dogodki,
    novice,
  })
}
