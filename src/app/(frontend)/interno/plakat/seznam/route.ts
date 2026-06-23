import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PLAKAT_STATUSI } from '@/collections/PlakatnaMesta'

// Seznam oddanih plakatnih mest za prikaz na zemljevidu (samo prijavljeni – ekipa).
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, mesta: [] }, { status: 401 })

  const res = await payload.find({
    collection: 'plakatna-mesta',
    where: { and: [{ lat: { exists: true } }, { lng: { exists: true } }] },
    limit: 500,
    depth: 1,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const label = (v: unknown) => PLAKAT_STATUSI.find((s) => s.value === v)?.label
  const mesta = res.docs.map((d: Record<string, unknown>) => {
    const arr = Array.isArray(d.foto) ? (d.foto as { url?: string }[]) : []
    const fotoUrls = arr.map((f) => f?.url).filter(Boolean) as string[]
    return {
      id: d.id,
      naslov: d.naslov,
      kraj: (d.kraj as string) || undefined,
      statusLabel: label(d.status),
      lat: d.lat,
      lng: d.lng,
      fotoUrls,
    }
  })

  return NextResponse.json({ ok: true, mesta }, { headers: { 'Cache-Control': 'no-store' } })
}
