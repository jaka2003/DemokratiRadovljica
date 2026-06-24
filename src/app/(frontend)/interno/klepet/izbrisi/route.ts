import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

// Izbris sporočila – svojega lahko izbriše vsak, kateregakoli pa administrator (moderacija).
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const id = Number(body?.id)
  if (!id) return NextResponse.json({ ok: false, error: 'Neveljaven ID.' }, { status: 400 })

  let m: Record<string, unknown>
  try {
    m = (await payload.findByID({ collection: 'sporocila', id, depth: 0, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    return NextResponse.json({ ok: false, error: 'Sporočilo ne obstaja.' }, { status: 404 })
  }

  const avtorId = m.avtor as string | number
  if (String(avtorId) !== String(user.id) && !isAdmin(user)) {
    return NextResponse.json({ ok: false, error: 'Tega sporočila ne morete izbrisati.' }, { status: 403 })
  }

  await payload.delete({ collection: 'sporocila', id, overrideAccess: true })
  return NextResponse.json({ ok: true })
}
