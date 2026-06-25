import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isUrednik } from '@/access/roles'

// Podatki za samodejno izpolnjevanje kandidata za svetnika iz izbranega uporabnika.
// Dostop: administrator ali urednik (kdor ureja svetnike). Bere prek overrideAccess,
// da deluje tudi za urednike (ki sicer ne morejo brati tujih uporabnikov).
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isUrednik(user)) return NextResponse.json({ ok: false, error: 'Ni dostopa.' }, { status: 403 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, error: 'Manjka id.' }, { status: 400 })

  let u: Record<string, unknown>
  try {
    u = (await payload.findByID({ collection: 'users', id, depth: 0, overrideAccess: true })) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: 'Uporabnik ni najden.' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    podatki: {
      imePriimek: (u.ime as string) || '',
      kraj: (u.naslovKraj as string) || '',
      poklic: (u.aiPoklic as string) || '',
      kratekOpis: (u.opis as string) || '',
      predstavitev: (u.politicnaPredstavitev as string) || (u.opis as string) || '',
      email: (u.osebniEmail as string) || (u.email as string) || '',
    },
  })
}
