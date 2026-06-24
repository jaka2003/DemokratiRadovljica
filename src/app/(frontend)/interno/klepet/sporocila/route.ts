import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { pogovorKljuc } from '@/lib/klepet'
import { imaDostopDoSobeServer, imenaUporabnikov } from '@/lib/klepet-server'

// Sporočila izbrane sobe (?soba=kljuc) ali zasebnega pogovora (?pogovor=idDrugega).
// Vrne zadnjih 150 sporočil, urejenih od najstarejšega proti najnovejšemu.
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const soba = searchParams.get('soba') || ''
  const pogovor = searchParams.get('pogovor') || ''
  const admin = isAdmin(user)

  let where: Record<string, unknown>
  if (soba) {
    if (!(await imaDostopDoSobeServer(payload, user as { id: string | number; vloga?: unknown }, admin, soba))) {
      return NextResponse.json({ ok: false, error: 'Nimate dostopa do te sobe.' }, { status: 403 })
    }
    where = { and: [{ vrsta: { equals: 'soba' } }, { soba: { equals: soba } }] }
  } else if (pogovor) {
    const drugiId = Number(pogovor)
    if (!drugiId || drugiId === Number(user.id)) {
      return NextResponse.json({ ok: false, error: 'Neveljaven pogovor.' }, { status: 400 })
    }
    // Ključ vsebuje ID prijavljenega uporabnika → bere lahko le svoje pogovore.
    where = { and: [{ vrsta: { equals: 'zasebno' } }, { pogovor: { equals: pogovorKljuc(user.id, drugiId) } }] }
  } else {
    return NextResponse.json({ ok: false, error: 'Manjka soba ali pogovor.' }, { status: 400 })
  }

  const res = await payload.find({
    collection: 'sporocila',
    where: where as never,
    sort: '-createdAt',
    limit: 150,
    depth: 0,
    overrideAccess: true,
  })
  const docs = (res.docs as Record<string, unknown>[]).reverse() // od najstarejšega
  const imena = await imenaUporabnikov(
    payload,
    docs.map((d) => d.avtor as string | number),
  )
  const sporocila = docs.map((d) => {
    const avtorId = d.avtor as string | number
    return {
      id: Number(d.id),
      besedilo: String(d.besedilo || ''),
      avtorId: Number(avtorId),
      avtorIme: imena[String(avtorId)] || 'Uporabnik',
      cas: String(d.createdAt || ''),
      jaz: String(avtorId) === String(user.id),
    }
  })
  return NextResponse.json({ ok: true, sporocila })
}
