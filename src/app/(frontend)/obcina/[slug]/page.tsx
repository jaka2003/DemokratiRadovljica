import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Send, Sparkles, ListChecks } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'
import { getKrajBySlug, getPobudeByKraj, getNoviceByKraj } from '@/lib/queries'
import { NoviceMini } from '@/components/site/NoviceMini'
import { ShareButtons } from '@/components/site/ShareButtons'
import { statusInfo } from '@/lib/pobude'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const k = await getKrajBySlug(slug)
  if (!k) return { title: 'Kraj' }
  return {
    title: k.naslov,
    description: k.opis,
    alternates: { canonical: `/obcina/${slug}` },
    openGraph: { title: k.naslov, description: k.opis || undefined, url: `/obcina/${slug}` },
  }
}

export default async function KrajPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const k = await getKrajBySlug(slug)
  if (!k) notFound()

  const pobude = await getPobudeByKraj(k.naslov)
  const novice = await getNoviceByKraj(k.id)
  const teme = (k.aktualneTeme ?? []).filter((t) => t.besedilo)
  const projekti = (k.projekti ?? []).filter((p) => p.besedilo)

  return (
    <article>
      {/* Naslovna fotografija */}
      <div className="relative h-56 w-full overflow-hidden bg-cloud sm:h-72 lg:h-80">
        {k.naslovnaFotografija?.url ? (
          <Image src={k.naslovnaFotografija.url} alt={k.naslovnaFotografija.alt || k.naslov} fill priority className="object-cover" sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-700 to-teal-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
        <Container className="relative flex h-full flex-col justify-end pb-6">
          <Link href="/obcina" className="mb-3 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-teal">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Vsi kraji
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">{k.naslov}</h1>
        </Container>
      </div>

      <Container className="max-w-4xl py-10 lg:py-14">
        {k.opis && <p className="whitespace-pre-line text-lg leading-relaxed text-navy/90">{k.opis}</p>}

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {/* Aktualne teme */}
          {teme.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <Sparkles className="h-5 w-5 text-teal" strokeWidth={2} /> Aktualne teme
              </h2>
              <ul className="mt-4 space-y-2.5">
                {teme.map((t, i) => (
                  <li key={i} className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-navy/90 shadow-card">
                    {t.besedilo}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Projekti */}
          {projekti.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <ListChecks className="h-5 w-5 text-teal" strokeWidth={2} /> Projekti in usmeritve
              </h2>
              <ul className="mt-4 space-y-2.5">
                {projekti.map((p, i) => (
                  <li key={i} className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-navy/90 shadow-card">
                    {p.besedilo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Pobude iz tega kraja */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-navy">Pobude občanov iz kraja {k.naslov}</h2>
          {pobude.length > 0 ? (
            <ul className="mt-5 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
              {pobude.map((pob) => (
                <li key={pob.id} className="flex items-center justify-between gap-3 p-4">
                  <span className="flex items-center gap-2.5 text-sm font-medium text-navy">
                    <MapPin className="h-4 w-4 text-teal" strokeWidth={2} /> {pob.naslov}
                  </span>
                  <span className="shrink-0 rounded-full bg-cloud px-2.5 py-1 text-xs font-medium text-navy/70">
                    {statusInfo(pob.status).label}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Za ta kraj še ni objavljenih pobud. Bodi prvi/-a.</p>
          )}
        </div>

        {/* Aktualne novice kraja */}
        <NoviceMini novice={novice} naslov="Aktualne novice" />

        {/* Deljenje */}
        <div className="mt-10 border-t border-line pt-6">
          <ShareButtons title={k.naslov} />
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-navy p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Imaš pobudo za {k.naslov}?</h3>
            <p className="mt-1 text-sm text-white/70">Označi lokacijo na zemljevidu in oddaj predlog.</p>
          </div>
          <Button href="/pobude" variant="teal" className="shrink-0">
            <Send className="h-4 w-4" strokeWidth={2} /> Oddaj pobudo
          </Button>
        </div>
      </Container>
    </article>
  )
}
