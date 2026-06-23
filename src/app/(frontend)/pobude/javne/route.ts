import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Javni, anonimiziran seznam odobrenih pobud za prikaz na zemljevidu.
// Vrne SAMO varna polja – nikoli osebnih podatkov predlagatelja (GDPR, spec. 3.6 in 13).
export async function GET() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pobude',
    where: {
      and: [
        { javnoObjavljeno: { equals: true } },
        { dovoliJavnoObjavo: { equals: true } },
        { lat: { exists: true } },
        { lng: { exists: true } },
      ],
    },
    limit: 500,
    depth: 1, // napolni fotografije (media), da lahko vrnemo URL prve slike
    overrideAccess: true,
  })

  const pobude = result.docs.map((d) => {
    const fotoArr = Array.isArray(d.foto) ? (d.foto as { url?: string }[]) : []
    const fotoUrls = fotoArr.map((f) => f?.url).filter(Boolean) as string[]
    return {
      id: d.id,
      naslov: d.naslov,
      kategorija: d.kategorija,
      kraj: d.kraj,
      status: d.status,
      lat: d.lat,
      lng: d.lng,
      fotoUrls,
    }
  })

  return NextResponse.json(
    { pobude },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
