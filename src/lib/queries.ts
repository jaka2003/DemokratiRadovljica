import { getPayload } from 'payload'
import config from '@payload-config'

export type Podrocje = {
  id: string | number
  naslov: string
  slug: string
  ikona: string
  kratekOpis?: string
  povezanaKategorija?: string
  uvod?: string
  ukrepi?: { besedilo: string }[]
  fotografije?: { slika?: { url?: string; alt?: string } }[]
}

export async function getProgramskaPodrocja(): Promise<Podrocje[]> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'programska-podrocja',
    where: { objavljeno: { equals: true } },
    sort: 'vrstniRed',
    limit: 100,
    depth: 1,
  })
  return res.docs as unknown as Podrocje[]
}

export async function getPodrocjeBySlug(slug: string): Promise<Podrocje | null> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'programska-podrocja',
    where: { and: [{ slug: { equals: slug } }, { objavljeno: { equals: true } }] },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as unknown as Podrocje) ?? null
}

export type PovezanaPobuda = {
  id: string | number
  naslov: string
  kraj: string
  status: string
}

// Povezane, javno odobrene pobude dane kategorije (anonimizirano).
export async function getPovezanePobude(kategorija?: string): Promise<PovezanaPobuda[]> {
  if (!kategorija) return []
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'pobude',
    where: {
      and: [
        { kategorija: { equals: kategorija } },
        { javnoObjavljeno: { equals: true } },
        { dovoliJavnoObjavo: { equals: true } },
      ],
    },
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  return res.docs.map((d) => ({
    id: d.id,
    naslov: d.naslov as string,
    kraj: d.kraj as string,
    status: d.status as string,
  }))
}

export type Novica = {
  id: string | number
  naslov: string
  slug: string
  datum?: string
  povzetek?: string
  vsebina?: string
  slika?: { url?: string; alt?: string }
}

const noviceSelect = (d: Record<string, unknown>): Novica => ({
  id: d.id as string,
  naslov: d.naslov as string,
  slug: d.slug as string,
  datum: d.datum as string,
  povzetek: d.povzetek as string,
  vsebina: d.vsebina as string,
  slika: d.slika as { url?: string; alt?: string },
})

export async function getNovice(limit = 50): Promise<Novica[]> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'novice',
    where: { objavljeno: { equals: true } },
    sort: '-datum',
    limit,
    depth: 1,
  })
  return res.docs.map(noviceSelect)
}

export async function getNovicaBySlug(slug: string): Promise<Novica | null> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'novice',
    where: { and: [{ slug: { equals: slug } }, { objavljeno: { equals: true } }] },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ? noviceSelect(res.docs[0]) : null
}

async function noviceWhere(extra: Record<string, unknown>, limit: number): Promise<Novica[]> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'novice',
    where: { and: [{ objavljeno: { equals: true } }, extra] },
    sort: '-datum',
    limit,
    depth: 1,
  })
  return res.docs.map(noviceSelect)
}

export const getNoviceByKraj = (krajId: string | number, limit = 10) =>
  noviceWhere({ kraj: { equals: krajId } }, limit)
export const getNoviceByPodrocje = (podrocjeId: string | number, limit = 10) =>
  noviceWhere({ podrocje: { equals: podrocjeId } }, limit)
export const getNoviceKandidat = (limit = 10) => noviceWhere({ naKandidatovi: { equals: true } }, limit)

export async function getNastavitve() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'nastavitve', depth: 0 }) as Promise<Record<string, unknown>>
}

export type Svetnik = {
  id: string | number
  imePriimek: string
  slug: string
  poklic?: string
  kraj?: string
  kratekOpis?: string
  predstavitev?: string
  email?: string
  fotografija?: { url?: string; alt?: string }
  poudarki?: { besedilo: string }[]
}

export async function getSvetniki(): Promise<Svetnik[]> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'svetniki',
    where: { objavljeno: { equals: true } },
    sort: 'vrstniRed',
    limit: 200,
    depth: 1,
  })
  return res.docs as unknown as Svetnik[]
}

export async function getSvetnikBySlug(slug: string): Promise<Svetnik | null> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'svetniki',
    where: { and: [{ slug: { equals: slug } }, { objavljeno: { equals: true } }] },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as unknown as Svetnik) ?? null
}

export async function getDomacaStran() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'domaca-stran', depth: 1 }) as Promise<Record<string, unknown>>
}

export async function getKandidat() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'kandidat', depth: 1 }) as Promise<Record<string, unknown>>
}

export type ClanEkipe = {
  id: string | number
  ime: string
  funkcija?: string
  opis?: string
  fotografija?: { url?: string; alt?: string }
}

export async function getEkipa(): Promise<ClanEkipe[]> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'ekipa',
    where: { objavljeno: { equals: true } },
    sort: 'vrstniRed',
    limit: 100,
    depth: 1,
  })
  return res.docs as unknown as ClanEkipe[]
}

export type Kraj = {
  id: string | number
  naslov: string
  slug: string
  opis?: string
  lat?: number
  lng?: number
  naslovnaFotografija?: { url?: string; alt?: string }
  aktualneTeme?: { besedilo: string }[]
  projekti?: { besedilo: string }[]
}

export async function getKraji(): Promise<Kraj[]> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'kraji',
    where: { objavljeno: { equals: true } },
    sort: 'vrstniRed',
    limit: 200,
    depth: 1,
  })
  return res.docs as unknown as Kraj[]
}

export async function getKrajBySlug(slug: string): Promise<Kraj | null> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'kraji',
    where: { and: [{ slug: { equals: slug } }, { objavljeno: { equals: true } }] },
    limit: 1,
    depth: 1,
  })
  return (res.docs[0] as unknown as Kraj) ?? null
}

// Odobrene, anonimizirane pobude iz danega kraja.
export async function getPobudeByKraj(krajNaslov: string): Promise<PovezanaPobuda[]> {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'pobude',
    where: {
      and: [
        { kraj: { equals: krajNaslov } },
        { javnoObjavljeno: { equals: true } },
        { dovoliJavnoObjavo: { equals: true } },
      ],
    },
    limit: 30,
    depth: 0,
    overrideAccess: true,
  })
  return res.docs.map((d) => ({
    id: d.id,
    naslov: d.naslov as string,
    kraj: d.kraj as string,
    status: d.status as string,
  }))
}
