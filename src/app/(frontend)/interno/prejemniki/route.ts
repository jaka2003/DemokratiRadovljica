import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

// Vrne uporabnike, ki ustrezajo izbranim kategorijam (vloge) – za prikaz in ročno izbiro
// prejemnikov pred pošiljanjem e-pošte. Samo za administratorja.
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const kategorije: string[] = Array.isArray(body?.kategorije) ? body.kategorije.map(String) : []
  const nacin = body?.nacin === 'vse' ? 'vse' : 'katera'

  // Brez kategorij = vsi uporabniki. Sicer unija (katera koli) ali presek (vse hkrati).
  const where =
    kategorije.length === 0
      ? {}
      : nacin === 'vse'
        ? { and: kategorije.map((k) => ({ vloga: { in: [k] } })) }
        : { vloga: { in: kategorije } }

  const res = await payload.find({
    collection: 'users',
    where: where as never,
    limit: 1000,
    depth: 0,
    sort: 'ime',
    overrideAccess: true,
  })

  const users = res.docs
    .filter((d: Record<string, unknown>) => d.email)
    .map((d: Record<string, unknown>) => ({
      id: d.id,
      ime: (d.ime as string) || (d.email as string),
      email: d.email as string,
      vloga: Array.isArray(d.vloga) ? (d.vloga as string[]) : d.vloga ? [String(d.vloga)] : [],
    }))

  return NextResponse.json({ ok: true, users, total: users.length })
}
