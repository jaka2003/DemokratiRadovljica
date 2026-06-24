import type { Payload } from 'payload'

export type Udelezenec = { id: string | number; ime: string; email?: string }

const imeOf = (u: Record<string, unknown>) =>
  (u.ime as string) || (u.email as string) || 'Uporabnik'

// Razreši vse udeležence seje (iz izbranih skupin/vlog + posameznih udeležencev), brez podvajanja.
export async function resolveUdelezenci(payload: Payload, seja: Record<string, unknown>): Promise<Udelezenec[]> {
  const result = new Map<string | number, Udelezenec>()

  const skupine = Array.isArray(seja.skupine) ? (seja.skupine as string[]) : []
  if (skupine.length) {
    const res = await payload.find({
      collection: 'users',
      where: { vloga: { in: skupine } },
      limit: 2000,
      depth: 0,
      overrideAccess: true,
    })
    for (const u of res.docs as Record<string, unknown>[]) {
      result.set(u.id as string | number, { id: u.id as string | number, ime: imeOf(u), email: u.email as string })
    }
  }

  const ids = (Array.isArray(seja.udelezenci) ? seja.udelezenci : [])
    .map((u) => (u && typeof u === 'object' ? (u as { id: string | number }).id : (u as string | number)))
    .filter((id) => id != null && !result.has(id))
  if (ids.length) {
    const res = await payload.find({
      collection: 'users',
      where: { id: { in: ids } },
      limit: 2000,
      depth: 0,
      overrideAccess: true,
    })
    for (const u of res.docs as Record<string, unknown>[]) {
      result.set(u.id as string | number, { id: u.id as string | number, ime: imeOf(u), email: u.email as string })
    }
  }

  return [...result.values()]
}

export function tockeOf(seja: Record<string, unknown>): { id: string; naslov: string; opis?: string }[] {
  return (Array.isArray(seja.tocke) ? seja.tocke : []) as { id: string; naslov: string; opis?: string }[]
}

// Samodejni zaključek: če so vsi udeleženci glasovali o vseh točkah ALI je potekel rok.
// Vrne posodobljen status seje.
export async function morebitenZakljucek(
  payload: Payload,
  seja: Record<string, unknown>,
  udelezenci: Udelezenec[],
): Promise<string> {
  let status = String(seja.status || 'osnutek')
  if (status === 'zakljucena' || status !== 'v_teku') return status

  const rok = seja.rokGlasovanja ? new Date(seja.rokGlasovanja as string).getTime() : 0
  const potekel = rok > 0 && Date.now() > rok

  let vsiGlasovali = false
  if (udelezenci.length > 0) {
    const tocke = tockeOf(seja)
    const potrebno = udelezenci.length * tocke.length
    if (potrebno > 0) {
      const { totalDocs } = await payload.count({
        collection: 'glasovi',
        where: { seja: { equals: seja.id } },
      })
      vsiGlasovali = totalDocs >= potrebno
    }
  }

  if (potekel || vsiGlasovali) {
    status = 'zakljucena'
    try {
      await payload.update({
        collection: 'seje',
        id: seja.id as string | number,
        data: { status, zakljucenoOb: new Date().toISOString() },
        overrideAccess: true,
      })
    } catch {
      /* neusodno */
    }
  }
  return status
}
