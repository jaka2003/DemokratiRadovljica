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
  const odstavki = String(k.opis || '')
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <article>
      {/* Naslovna fotografija */}
      <div className="relative h-64 w-full overflow-hidden bg-cloud sm:h-80 lg:h-[26rem]">
        {k.naslovnaFotografija?.url ? (
          <Image src={k.naslovnaFotografija.url} alt={k.naslovnaFotografija.alt || k.naslov} fill priority className="object-cover" sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-700 to-teal-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <Container className="relative flex h-full flex-col justify-end pb-8">
          <Link href="/obcina" className="mb-3 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-teal">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Vsi kraji
          </Link>
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-teal px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.2} /> Kraj občine Radovljica
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{k.naslov}</h1>
        </Container>
      </div>

      <Container className="max-w-4xl py-10 lg:py-14">
        {/* Opis – prvi odstavek poudarjen (lead), ostalo mehkeje */}
        {odstavki.length > 0 && (
          <div className="max-w-3xl">
            <p className="text-xl font-medium leading-relaxed text-navy sm:text-[1.4rem] sm:leading-[1.6]">{odstavki[0]}</p>
            {odstavki.length > 1 && (
              <div className="mt-4 space-y-4">
                {odstavki.slice(1).map((o, i) => (
                  <p key={i} className="text-base leading-relaxed text-muted">
                    {o}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {(teme.length > 0 || projekti.length > 0) && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Aktualne teme */}
            {teme.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card">
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                  <Sparkles className="h-5 w-5 text-teal" strokeWidth={2} /> Aktualne teme
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {teme.map((t, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-navy/85">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      {t.besedilo}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Projekti */}
            {projekti.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card">
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                  <ListChecks className="h-5 w-5 text-teal" strokeWidth={2} /> Projekti in usmeritve
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {projekti.map((p, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-navy/85">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      {p.besedilo}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
