import type { Payload } from 'payload'
import { customId, customKljuc, imaDostopDoSobe, sobeZaUporabnika } from './klepet'

// Strežniške pomožne funkcije za klepet (imena uporabnikov, dostop do sob ipd.).

export const imeUporabnika = (u: Record<string, unknown> | null | undefined): string =>
  (u?.ime as string) || (u?.email as string) || 'Uporabnik'

const vlogeArray = (vloge: unknown): string[] =>
  Array.isArray(vloge) ? (vloge as string[]) : vloge ? [String(vloge)] : []

export type DostopnaSoba = { kljuc: string; naziv: string; ikona: string; opis: string }

type MinUser = { id: string | number; vloga?: unknown }

// Vse sobe, ki jih uporabnik vidi: fiksne (iz kode) + lastne skupine iz baze (po članstvu).
export async function dostopneSobe(payload: Payload, user: MinUser, admin: boolean): Promise<DostopnaSoba[]> {
  const fiksne: DostopnaSoba[] = sobeZaUporabnika(user.vloga, admin).map((s) => ({
    kljuc: s.kljuc,
    naziv: s.naziv,
    ikona: s.ikona,
    opis: s.opis,
  }))

  const vloge = vlogeArray(user.vloga)
  const where = admin
    ? { objavljeno: { equals: true } }
    : {
        and: [
          { objavljeno: { equals: true } },
          {
            or: [
              { vsiClani: { equals: true } },
              ...(vloge.length ? [{ vloge: { in: vloge } }] : []),
              { clani: { in: [user.id] } },
            ],
          },
        ],
      }

  const res = await payload.find({
    collection: 'klepet-skupine',
    where: where as never,
    sort: 'naziv',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })
  const custom: DostopnaSoba[] = (res.docs as Record<string, unknown>[]).map((d) => ({
    kljuc: customKljuc(d.id as string | number),
    naziv: String(d.naziv || 'Skupina'),
    ikona: String(d.ikona || '#️⃣'),
    opis: String(d.opis || ''),
  }))

  return [...fiksne, ...custom]
}

// Ali ima uporabnik dostop do sobe (fiksne ali lastne skupine iz baze).
export async function imaDostopDoSobeServer(
  payload: Payload,
  user: MinUser,
  admin: boolean,
  kljuc: string,
): Promise<boolean> {
  const id = customId(kljuc)
  if (id == null) return imaDostopDoSobe(user.vloga, kljuc, admin)

  let skupina: Record<string, unknown> | null = null
  try {
    skupina = (await payload.findByID({
      collection: 'klepet-skupine',
      id,
      depth: 0,
      overrideAccess: true,
    })) as Record<string, unknown>
  } catch {
    return false
  }
  if (!skupina) return false
  if (admin) return true
  if (skupina.objavljeno === false) return false
  if (skupina.vsiClani === true) return true

  const vloge = vlogeArray(user.vloga)
  const skupinaVloge = vlogeArray(skupina.vloge)
  if (skupinaVloge.some((r) => vloge.includes(r))) return true

  const clani = (Array.isArray(skupina.clani) ? skupina.clani : []).map((c) =>
    c && typeof c === 'object' ? (c as { id: unknown }).id : c,
  )
  return clani.some((c) => String(c) === String(user.id))
}

// Zemljevid id → ime za dane uporabnike (en sam poizvedba namesto depth-join na vsako sporočilo).
export async function imenaUporabnikov(
  payload: Payload,
  ids: (string | number)[],
): Promise<Record<string, string>> {
  const unikatni = [...new Set(ids.map((i) => String(i)))].filter(Boolean)
  if (!unikatni.length) return {}
  const res = await payload.find({
    collection: 'users',
    where: { id: { in: unikatni } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  const map: Record<string, string> = {}
  for (const u of res.docs as Record<string, unknown>[]) map[String(u.id)] = imeUporabnika(u)
  return map
}
