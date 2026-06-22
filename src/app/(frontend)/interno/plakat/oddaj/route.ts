import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { KRAJI } from '@/lib/pobude'
import { inObcina } from '@/lib/obcina'

function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

// Oddaja predloga za plakatno mesto – samo za prijavljene (kandidati/člani).
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return err('Potrebna je prijava.', 401)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return err('Neveljavna zahteva.')
  }

  const get = (k: string) => String(form.get(k) ?? '').trim()
  const naslov = get('naslov')
  const opis = get('opis')
  const kraj = get('kraj')
  const lat = get('lat') ? Number(get('lat')) : undefined
  const lng = get('lng') ? Number(get('lng')) : undefined

  if (!naslov || naslov.length < 3) return err('Vnesi kratek opis lokacije (vsaj 3 znake).')
  if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng))
    return err('Označi lokacijo na zemljevidu.')
  if (!inObcina(lat, lng)) return err('Lokacija mora biti znotraj občine Radovljica.')
  if (kraj && !(KRAJI as readonly string[]).includes(kraj)) return err('Izberi veljaven kraj.')

  // Fotografije (do 4).
  const fotoIds: (string | number)[] = []
  const files = form
    .getAll('foto')
    .filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f && (f as File).size > 0)
    .slice(0, 4)
  for (const f of files) {
    if (!f.type.startsWith('image/')) return err('Priložene datoteke morajo biti slike.')
    if (f.size > 8 * 1024 * 1024) return err('Slika je prevelika (največ 8 MB).')
  }
  for (const f of files) {
    try {
      const buffer = Buffer.from(await f.arrayBuffer())
      const media = await payload.create({
        collection: 'media',
        data: { alt: naslov },
        file: { data: buffer, mimetype: f.type, name: f.name || 'plakat.jpg', size: f.size },
        overrideAccess: true,
      })
      fotoIds.push(media.id)
    } catch (e) {
      console.error('Napaka pri nalaganju slike:', e)
    }
  }

  try {
    await payload.create({
      collection: 'plakatna-mesta',
      data: {
        naslov,
        opis: opis || undefined,
        kraj: (kraj || undefined) as never,
        lat,
        lng,
        status: 'predlagano',
        predlagatelj: user.id,
        ...(fotoIds.length ? { foto: fotoIds } : {}),
      },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Napaka pri shranjevanju plakatnega mesta:', e)
    return err('Predloga ni bilo mogoče shraniti.', 500)
  }

  return NextResponse.json({ ok: true })
}
