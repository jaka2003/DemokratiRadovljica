import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

export const dynamic = 'force-dynamic'

type NalogaRow = { id: string | number; naslov: string; status: string; rok?: string }
type Oseba = { id: string | number; ime: string; email: string; naloge: NalogaRow[] }

// Naloge, združene po osebi (thread). Samo admin.
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const res = await payload.find({ collection: 'naloge', depth: 1, overrideAccess: true, limit: 1000, sort: 'rok' })
  const osebe = new Map<string, Oseba>()
  for (const d of res.docs as Record<string, unknown>[]) {
    const k = d.kandidat as { id?: string | number; ime?: string; email?: string } | null
    if (!k || typeof k !== 'object' || k.id == null) continue
    const key = String(k.id)
    if (!osebe.has(key)) osebe.set(key, { id: k.id, ime: k.ime || k.email || 'Neznana oseba', email: k.email || '', naloge: [] })
    osebe.get(key)!.naloge.push({
      id: d.id as string | number,
      naslov: (d.naslov as string) || '(brez naslova)',
      status: (d.status as string) || 'odprta',
      rok: (d.rok as string) || undefined,
    })
  }

  const jeOdprta = (s: string) => s !== 'zakljucena'
  const list = Array.from(osebe.values())
    .map((o) => ({
      ...o,
      odprte: o.naloge.filter((n) => jeOdprta(n.status)).length,
      zakljucene: o.naloge.filter((n) => !jeOdprta(n.status)).length,
    }))
    // Osebe z največ odprtimi nalogami najprej (potrebujejo pozornost).
    .sort((a, b) => b.odprte - a.odprte || a.ime.localeCompare(b.ime, 'sl'))

  return NextResponse.json({ ok: true, osebe: list })
}
