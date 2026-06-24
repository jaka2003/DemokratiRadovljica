import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { pogovorKljuc } from '@/lib/klepet'
import { imaDostopDoSobeServer, imeUporabnika } from '@/lib/klepet-server'

// Pošlji sporočilo v sobo ({ soba, besedilo }) ali zasebno ({ prejemnik, besedilo }).
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const soba = typeof body?.soba === 'string' ? body.soba : ''
  const prejemnik = body?.prejemnik
  const besedilo = String(body?.besedilo || '').trim()
  if (!besedilo) return NextResponse.json({ ok: false, error: 'Sporočilo je prazno.' }, { status: 400 })
  if (besedilo.length > 4000) return NextResponse.json({ ok: false, error: 'Sporočilo je predolgo.' }, { status: 400 })

  const admin = isAdmin(user)
  let data: Record<string, unknown>
  if (soba) {
    if (!(await imaDostopDoSobeServer(payload, user as { id: string | number; vloga?: unknown }, admin, soba))) {
      return NextResponse.json({ ok: false, error: 'Nimate dostopa do te sobe.' }, { status: 403 })
    }
    data = { vrsta: 'soba', soba, avtor: user.id, besedilo }
  } else if (prejemnik != null) {
    const drugiId = Number(prejemnik)
    if (!drugiId || drugiId === Number(user.id)) {
      return NextResponse.json({ ok: false, error: 'Neveljaven prejemnik.' }, { status: 400 })
    }
    try {
      await payload.findByID({ collection: 'users', id: drugiId, depth: 0, overrideAccess: true })
    } catch {
      return NextResponse.json({ ok: false, error: 'Prejemnik ne obstaja.' }, { status: 404 })
    }
    data = {
      vrsta: 'zasebno',
      prejemnik: drugiId,
      pogovor: pogovorKljuc(user.id, drugiId),
      avtor: user.id,
      besedilo,
    }
  } else {
    return NextResponse.json({ ok: false, error: 'Manjka soba ali prejemnik.' }, { status: 400 })
  }

  let created: Record<string, unknown>
  try {
    created = (await payload.create({ collection: 'sporocila', data, overrideAccess: true })) as Record<string, unknown>
  } catch (e) {
    console.error('Napaka pri shranjevanju sporočila:', e)
    return NextResponse.json(
      { ok: false, error: 'Sporočila ni bilo mogoče poslati.', detail: (e as Error).message },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    sporocilo: {
      id: Number(created.id),
      besedilo,
      avtorId: Number(user.id),
      avtorIme: imeUporabnika(user as unknown as Record<string, unknown>),
      cas: String(created.createdAt || new Date().toISOString()),
      jaz: true,
    },
  })
}
