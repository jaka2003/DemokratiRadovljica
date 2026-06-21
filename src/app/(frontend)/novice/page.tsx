import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Newspaper } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { getNovice } from '@/lib/queries'

export const metadata = { title: 'Aktualno', description: 'Novice, dogodki in obvestila Demokrati Radovljica.' }
export const dynamic = 'force-dynamic'

function datum(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getDate()}. ${dt.getMonth() + 1}. ${dt.getFullYear()}`
}

export default async function NovicePage() {
  const novice = await getNovice()

  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Aktualno
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">Novice in obvestila</h1>
          <p className="mt-3 text-muted">Spremljaj aktualne novice, dogodke in obvestila lokalne ekipe.</p>
        </div>

        {novice.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cloud text-teal">
              <Newspaper className="h-7 w-7" strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-muted">Trenutno še ni objavljenih novic.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {novice.map((n) => (
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
                  <h2 className="mt-1 font-bold leading-snug text-navy">{n.naslov}</h2>
                  {n.povzetek && <p className="mt-2 flex-1 text-sm text-muted">{n.povzetek}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                    Preberi <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
