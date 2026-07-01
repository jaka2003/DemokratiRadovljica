import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'
import { HERO } from '@/lib/site'
import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel'

export function Hero({
  naslov,
  podnaslov,
  opis,
  poudarek,
  tagline,
  slike = [],
  intervalSekunde = 3,
}: {
  naslov?: string
  podnaslov?: string
  opis?: string
  poudarek?: string
  tagline?: string
  slike?: HeroSlide[]
  intervalSekunde?: number
} = {}) {
  const title = naslov || HERO.title
  const subtitle = podnaslov || HERO.subtitle
  const description = opis || HERO.description
  const emphasis = poudarek || HERO.emphasis
  const slogan = tagline || HERO.tagline

  // Če ima slika povezavo, je clickable.
  const ovijVPovezavo = (node: React.ReactNode, link?: string) =>
    link ? (
      <a href={link} aria-label="Odpri povezavo" className="block transition-opacity hover:opacity-95">
        {node}
      </a>
    ) : (
      node
    )

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cloud to-white">
      <Container className="py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Levo: glavni tekst */}
          <div>
            <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              Lokalne volitve 2026
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-navy sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-xl font-semibold text-navy/90">{subtitle}</p>
            <p className="mt-4 max-w-xl whitespace-pre-line text-base leading-relaxed text-muted">{description}</p>

            <p className="mt-6 text-base font-medium text-navy">{emphasis}</p>
            <p className="mt-1 text-base font-semibold text-teal-700">{slogan}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={HERO.primaryCta.href} variant="primary">
                {HERO.primaryCta.label}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Button>
              <Button href={HERO.secondaryCta.href} variant="outline">
                <MapPin className="h-4 w-4" strokeWidth={2} />
                {HERO.secondaryCta.label}
              </Button>
            </div>
          </div>

          {/* Desno: grafika / fotografija (admin jo naloži v CMS) */}
          <div className="relative">
            {slike.length > 1 ? (
              // Več slik → moderni carousel z nežnim prelivanjem (vsaka slika ima svojo povezavo).
              <HeroCarousel slides={slike} intervalMs={intervalSekunde * 1000} />
            ) : slike.length === 1 ? (
              // Ena slika se pokaže v CELOTI (brez obrezovanja) – primerno za oblikovane plakate.
              slike[0].width && slike[0].height ? (
                ovijVPovezavo(
                  <Image
                    src={slike[0].url}
                    alt={slike[0].alt || 'Demokrati Radovljica'}
                    width={slike[0].width}
                    height={slike[0].height}
                    priority
                    className="h-auto w-full rounded-[var(--radius-card)] shadow-card"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />,
                  slike[0].povezava,
                )
              ) : (
                // Brez podatka o velikosti: prikaži celoto znotraj okvirja (object-contain).
                ovijVPovezavo(
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-cloud shadow-card">
                    <Image src={slike[0].url} alt={slike[0].alt || 'Demokrati Radovljica'} fill priority className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" />
                  </div>,
                  slike[0].povezava,
                )
              )
            ) : (
              // Nadomestna podoba – do nalaganja prave slike v CMS.
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-card">
                <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-700 to-teal-700" />
                <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_80%_-10%,rgba(0,187,193,0.45),transparent_55%)]" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                    Radovljica
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
