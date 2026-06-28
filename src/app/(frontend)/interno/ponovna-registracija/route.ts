import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { posljiPozdrav } from '@/lib/pozdrav'

// Ponovno pošlje uporabniku povezavo za nastavitev gesla (ponovna registracija). Samo admin.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const userId = (await req.json().catch(() => ({})))?.userId
  if (!userId) return NextResponse.json({ ok: false, error: 'Manjka uporabnik.' }, { status: 400 })

  try {
    await posljiPozdrav(payload, userId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Ponovna registracija ni bila poslana:', e)
    return NextResponse.json(
      { ok: false, error: 'Sporočila ni bilo mogoče poslati.', detail: (e as Error).message },
      { status: 500 },
    )
  }
}
