import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

export const dynamic = 'force-dynamic'

type OsebaVNalogi = { nalogaId: string | number; userId: string | number; ime: string; email: string; status: string }
type NalogaGroup = { naslov: string; rok?: string; osebe: OsebaVNalogi[] }

// Naloge, združene PO NALOGI (naslovu); znotraj vsake so posamezne osebe s svojim statusom. Samo admin.
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const res = await payload.find({ collection: 'naloge', depth: 1, overrideAccess: true, limit: 1000, sort: 'naslov' })
  const skupine = new Map<string, NalogaGroup>()
  for (const d of res.docs as Record<string, unknown>[]) {
    const naslov = ((d.naslov as string) || '(brez naslova)').trim()
    const key = naslov.toLowerCase()
    if (!skupine.has(key)) skupine.set(key, { naslov, rok: (d.rok as string) || undefined, osebe: [] })
    const g = skupine.get(key)!
    if (!g.rok && d.rok) g.rok = d.rok as string
    const k = d.kandidat as { id?: string | number; ime?: string; email?: string } | null
    g.osebe.push({
      nalogaId: d.id as string | number,
      userId: k && typeof k === 'object' ? (k.id as string | number) : (d.kandidat as string | number),
      ime: (k && typeof k === 'object' && (k.ime || k.email)) || 'Neznana oseba',
      email: (k && typeof k === 'object' && k.email) || '',
      status: (d.status as string) || 'odprta',
    })
  }

  const jeOdprta = (s: string) => s !== 'zakljucena'
  const list = Array.from(skupine.values())
    .map((g) => ({
      ...g,
      osebe: g.osebe.sort((a, b) => Number(jeOdprta(b.status)) - Number(jeOdprta(a.status)) || a.ime.localeCompare(b.ime, 'sl')),
      odprte: g.osebe.filter((o) => jeOdprta(o.status)).length,
      opravljene: g.osebe.filter((o) => !jeOdprta(o.status)).length,
    }))
    // Naloge z največ odprtimi (nedokončanimi) najprej.
    .sort((a, b) => b.odprte - a.odprte || a.naslov.localeCompare(b.naslov, 'sl'))

  return NextResponse.json({ ok: true, naloge: list })
}
