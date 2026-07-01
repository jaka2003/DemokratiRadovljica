import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { posljiOpomin } from '@/lib/nalogaOpomin'

// Pošlje osebi opomin (ali urgenco) za nalogo(e). Samo admin.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const userId = body?.userId
  const nalogaId = body?.nalogaId || undefined
  const urgentno = Boolean(body?.urgentno)
  if (!userId) return NextResponse.json({ ok: false, error: 'Manjka oseba.' }, { status: 400 })

  try {
    const count = await posljiOpomin(payload, { userId, nalogaId, urgentno })
    return NextResponse.json({ ok: true, count })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message || 'Opomina ni bilo mogoče poslati.' }, { status: 500 })
  }
}
