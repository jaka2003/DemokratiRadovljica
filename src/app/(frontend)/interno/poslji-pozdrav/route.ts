import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { posljiPozdrav } from '@/lib/pozdrav'

// Ročno pošiljanje pozdravnega sporočila uporabniku (gumb na zapisu). Samo administrator.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const userId = body?.userId
  if (!userId) return NextResponse.json({ ok: false, error: 'Manjka uporabnik.' }, { status: 400 })

  try {
    const poslanoOb = await posljiPozdrav(payload, userId)
    return NextResponse.json({ ok: true, poslanoOb })
  } catch (e) {
    console.error('Pozdravno sporočilo ni bilo poslano:', e)
    return NextResponse.json(
      { ok: false, error: 'Sporočila ni bilo mogoče poslati.', detail: (e as Error).message },
      { status: 500 },
    )
  }
}
