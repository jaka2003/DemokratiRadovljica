import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { posljiOpomin } from '@/lib/nalogaOpomin'

type Par = { userId: string | number; nalogaId?: string | number }

// Pošlje opomin (ali urgenco) za nalogo(e). Sprejme enega (userId + nalogaId) ali več parov (pari). Samo admin.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const urgentno = Boolean(body?.urgentno)
  const pari: Par[] = Array.isArray(body?.pari)
    ? body.pari
    : body?.userId
      ? [{ userId: body.userId, nalogaId: body.nalogaId }]
      : []
  if (pari.length === 0) return NextResponse.json({ ok: false, error: 'Manjka oseba.' }, { status: 400 })

  let poslano = 0
  let nalog = 0
  let zadnjaNapaka = ''
  for (const p of pari) {
    if (!p?.userId) continue
    try {
      nalog += await posljiOpomin(payload, { userId: p.userId, nalogaId: p.nalogaId, urgentno })
      poslano++
    } catch (e) {
      zadnjaNapaka = (e as Error).message
    }
  }

  if (poslano === 0) {
    return NextResponse.json({ ok: false, error: zadnjaNapaka || 'Opomina ni bilo mogoče poslati.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, sent: poslano, count: nalog })
}
