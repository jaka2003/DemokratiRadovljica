import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import { Container } from '@/components/site/Container'
import ObcinaMapClient from '@/components/obcina/ObcinaMapClient'
import { getKraji } from '@/lib/queries'

export const metadata = {
  title: 'Občina Radovljica',
  description: 'Občina Radovljica in njeni kraji – predstavitev, zemljevid in aktualne teme po krajevnih skupnostih.',
}

export const dynamic = 'force-dynamic'

export default async function ObcinaPage() {
  const kraji = await getKraji()
  const pins = kraji
    .filter((k) => typeof k.lat === 'number' && typeof k.lng === 'number')
    .map((k) => ({ slug: k.slug, naslov: k.naslov, lat: k.lat as number, lng: k.lng as number }))

  return (
    <section className="py-12 lg:py-16">
      <Container>
        {/* Uvod */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Občina
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">Občina Radovljica</h1>
          <p className="mt-3 text-muted">
            Občina vseh krajev, vseh generacij in vseh ljudi. Spodaj so kraji občine – klikni na kraj
            za predstavitev, aktualne teme in pobude občanov.
          </p>
        </div>

        {/* Zemljevid občine s kraji */}
        <div className="mt-12 overflow-hidden rounded-[var(--radius-card)] border border-line shadow-card">
          <ObcinaMapClient kraji={pins} />
        </div>

        {/* Mreža krajev */}
        <h2 className="mt-14 text-2xl font-bold tracking-tight text-navy">Kraji občine</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {kraji.map((k) => (
            <Link
              key={k.id}
              href={`/obcina/${k.slug}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-cloud">
                {k.naslovnaFotografija?.url ? (
                  <Image src={k.naslovnaFotografija.url} alt={k.naslovnaFotografija.alt || k.naslov} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy/90 to-teal-700 text-white/90">
                    <MapPin className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-navy">{k.naslov}</h3>
                {k.opis && <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{k.opis}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                  Več o kraju
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
