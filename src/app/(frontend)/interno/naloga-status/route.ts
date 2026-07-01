import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

// Prijavljeni uporabnik označi SVOJO nalogo kot opravljeno (ali ponovno odprto). Admin lahko katerokoli.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const nalogaId = body?.nalogaId
  const done = body?.done !== false // privzeto true
  if (!nalogaId) return NextResponse.json({ ok: false, error: 'Manjka naloga.' }, { status: 400 })

  const n = (await payload
    .findByID({ collection: 'naloge', id: nalogaId, depth: 0, overrideAccess: true })
    .catch(() => null)) as { kandidat?: unknown } | null
  if (!n) return NextResponse.json({ ok: false, error: 'Naloga ne obstaja.' }, { status: 404 })

  const lastnik = n.kandidat && typeof n.kandidat === 'object' ? (n.kandidat as { id?: unknown }).id : n.kandidat
  if (String(lastnik) !== String(user.id) && !isAdmin(user)) {
    return NextResponse.json({ ok: false, error: 'To ni vaša naloga.' }, { status: 403 })
  }

  await payload.update({
    collection: 'naloge',
    id: nalogaId,
    data: { status: done ? 'zakljucena' : 'odprta' },
    overrideAccess: true,
  })
  return NextResponse.json({ ok: true })
}
