import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, MapPin, Send } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/lib/icons'
import type { IconName } from '@/lib/site'
import { getPodrocjeBySlug, getPovezanePobude, getNoviceByPodrocje } from '@/lib/queries'
import { NoviceMini } from '@/components/site/NoviceMini'
import { statusInfo } from '@/lib/pobude'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPodrocjeBySlug(slug)
  if (!p) return { title: 'Programsko področje' }
  return { title: p.naslov, description: p.kratekOpis }
}

export default async function PodrocjePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPodrocjeBySlug(slug)
  if (!p) notFound()

  const pobude = await getPovezanePobude(p.povezanaKategorija)
  const novice = await getNoviceByPodrocje(p.id)
  const fotografije = (p.fotografije ?? []).filter((f) => f.slika?.url)

  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-4xl">
        <Link href="/program" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Nazaj na program
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cloud text-teal">
            <Icon name={p.ikona as IconName} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{p.naslov}</h1>
            {p.kratekOpis && <p className="mt-2 text-lg text-muted">{p.kratekOpis}</p>}
          </div>
        </div>

        {p.uvod && <p className="mt-8 text-base leading-relaxed text-navy/90">{p.uvod}</p>}

        {/* Konkretni ukrepi */}
        {p.ukrepi && p.ukrepi.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-navy">Konkretni ukrepi</h2>
            <ul className="mt-5 space-y-3">
              {p.ukrepi.map((u, i) => (
                <li key={i} className="flex items-start gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-card">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm text-navy/90">{u.besedilo}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fotografije */}
        {fotografije.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fotografije.map((f, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-line">
                <Image src={f.slika!.url!} alt={f.slika!.alt || p.naslov} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              </div>
            ))}
          </div>
        )}

        {/* Povezane pobude občanov */}
        {pobude.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-navy">Povezane pobude občanov</h2>
            <p className="mt-1 text-sm text-muted">Odobrene pobude s tega področja.</p>
            <ul className="mt-5 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
              {pobude.map((pob) => (
                <li key={pob.id} className="flex items-center justify-between gap-3 p-4">
                  <span className="flex items-center gap-2.5 text-sm font-medium text-navy">
                    <MapPin className="h-4 w-4 text-teal" strokeWidth={2} />
                    {pob.naslov} <span className="text-muted">· {pob.kraj}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-cloud px-2.5 py-1 text-xs font-medium text-navy/70">
                    {statusInfo(pob.status).label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Povezane objave */}
        <NoviceMini novice={novice} naslov="Povezane objave" />

        {/* CTA */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-navy p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Imaš predlog za to področje?</h3>
            <p className="mt-1 text-sm text-white/70">Oddaj pobudo in pomagaj oblikovati program.</p>
          </div>
          <Button href="/pobude" variant="teal" className="shrink-0">
            <Send className="h-4 w-4" strokeWidth={2} /> Oddaj pobudo
          </Button>
        </div>
      </Container>
    </section>
  )
}
