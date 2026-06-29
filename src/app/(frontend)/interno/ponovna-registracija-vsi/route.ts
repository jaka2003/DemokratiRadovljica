import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { posljiPozdrav } from '@/lib/pozdrav'

// Vsem uporabnikom z NEaktiviranim računom (brez zadnje prijave) ponovno pošlje povezavo za
// nastavitev gesla. Samo administrator.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const res = await payload.find({
    collection: 'users',
    where: { and: [{ zadnjaPrijava: { exists: false } }, { aktiven: { not_equals: false } }] },
    limit: 2000,
    depth: 0,
    overrideAccess: true,
  })

  let count = 0
  for (const u of res.docs as { id: string | number; email?: string }[]) {
    if (!u.email) continue
    try {
      await posljiPozdrav(payload, u.id)
      count++
    } catch (e) {
      console.error('Ponovna registracija (skupinsko) ni bila poslana:', e)
    }
  }

  return NextResponse.json({ ok: true, count })
}
