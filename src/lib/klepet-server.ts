import type { Payload } from 'payload'

// Strežniške pomožne funkcije za klepet (imena uporabnikov ipd.).

export const imeUporabnika = (u: Record<string, unknown> | null | undefined): string =>
  (u?.ime as string) || (u?.email as string) || 'Uporabnik'

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
