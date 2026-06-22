import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getNastavitve } from '@/lib/queries'

// Preveri geslo za vstop na zaklenjeno javno stran in nastavi piškotek za odklep.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const geslo = String(body?.geslo ?? '')

  const n = (await getNastavitve()) as Record<string, unknown>
  const pravo = String(n.zaklenjenoGeslo ?? '')

  if (!pravo || geslo !== pravo) {
    return NextResponse.json({ ok: false, error: 'Napačno geslo.' }, { status: 401 })
  }

  const token = createHash('sha256').update(pravo).digest('hex')
  const res = NextResponse.json({ ok: true })
  res.cookies.set('vstop', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dni
  })
  return res
}
