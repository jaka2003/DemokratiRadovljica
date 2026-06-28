import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { koreni, oceni } from '@/lib/bot'

// GET: seznam programskih področij (za predloge/čipe v robotu).
export async function GET() {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'programska-podrocja',
    where: { objavljeno: { equals: true } },
    sort: 'vrstniRed',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  const podrocja = (res.docs as Record<string, unknown>[]).map((p) => ({
    naslov: String(p.naslov || ''),
    slug: String(p.slug || ''),
  }))
  return NextResponse.json({ ok: true, podrocja })
}

// POST: poišči najbolj ustrezna področja programa in odgovorjena vprašanja (brez AI).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const vprasanje = String(body?.vprasanje || '').trim().slice(0, 300)
  if (!vprasanje) return NextResponse.json({ ok: false, error: 'Prazno vprašanje.' }, { status: 400 })

  const q = koreni(vprasanje)
  const payload = await getPayload({ config })

  const [progRes, qaRes] = await Promise.all([
    payload.find({
      collection: 'programska-podrocja',
      where: { objavljeno: { equals: true } },
      sort: 'vrstniRed',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'vprasanja',
      where: { objavljeno: { equals: true } },
      sort: '-createdAt',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const programska = (progRes.docs as Record<string, unknown>[])
    .map((p) => {
      const ukrepi = Array.isArray(p.ukrepi)
        ? (p.ukrepi as { besedilo?: string }[]).map((u) => String(u?.besedilo || '')).join(' ')
        : ''
      const score =
        oceni(String(p.naslov || ''), q) * 3 +
        oceni(String(p.kratekOpis || ''), q) * 2 +
        oceni(`${String(p.uvod || '')} ${ukrepi}`, q)
      return {
        naslov: String(p.naslov || ''),
        slug: String(p.slug || ''),
        opis: String(p.kratekOpis || p.uvod || '').slice(0, 220),
        score,
      }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...rest }) => rest) // eslint-disable-line @typescript-eslint/no-unused-vars

  const vprasanja = (qaRes.docs as Record<string, unknown>[])
    .map((v) => {
      const odgovor = String(v.odgovor || '')
      if (!odgovor.trim()) return null
      const score = oceni(String(v.vprasanje || ''), q) * 2 + oceni(odgovor, q)
      return { vprasanje: String(v.vprasanje || ''), odgovor, score }
    })
    .filter((x): x is { vprasanje: string; odgovor: string; score: number } => !!x && x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score, ...rest }) => rest) // eslint-disable-line @typescript-eslint/no-unused-vars

  return NextResponse.json({ ok: true, najden: programska.length > 0 || vprasanja.length > 0, programska, vprasanja })
}
