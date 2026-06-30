import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Newspaper } from 'lucide-react'
import { Container } from '@/components/site/Container'
import type { Novica } from '@/lib/queries'

function datum(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getDate()}. ${dt.getMonth() + 1}. ${dt.getFullYear()}`
}

// Zadnje novice na domači strani – da niso skrite (vidno mesto).
export function NoviceHome({ novice }: { novice: Novica[] }) {
  if (!novice || novice.length === 0) return null

  return (
    <section className="border-y border-line bg-cloud/40 py-14 lg:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              Aktualno
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy">Aktualne novice</h2>
            <p className="mt-2 text-muted">Novice, dogodki in obvestila lokalne ekipe.</p>
          </div>
          <Link
            href="/novice"
            className="hidden items-center gap-1.5 text-sm font-semibold text-teal-700 transition-colors hover:text-teal sm:inline-flex"
          >
            Vse novice <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {novice.slice(0, 3).map((n) => (
            <Link
              key={n.id}
              href={`/novice/${n.slug}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/9] bg-cloud">
                {n.slika?.url ? (
                  <Image src={n.slika.url} alt={n.slika.alt || n.naslov} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-navy/20">
                    <Newspaper className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                {n.datum && <span className="text-xs font-medium text-teal-700">{datum(n.datum)}</span>}
                <h3 className="mt-1 font-bold leading-snug text-navy">{n.naslov}</h3>
                {n.povzetek && <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{n.povzetek}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                  Preberi <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link
            href="/novice"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition-colors hover:text-teal"
          >
            Vse novice <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </Container>
    </section>
  )
}
