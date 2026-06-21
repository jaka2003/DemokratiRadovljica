import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Check, Send, MapPin } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'
import SimpleForm from '@/components/forms/SimpleForm'
import { getSvetnikBySlug } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = await getSvetnikBySlug(slug)
  if (!s) return { title: 'Kandidat za svetnika' }
  return { title: `${s.imePriimek} – kandidat za svetnika`, description: s.kratekOpis }
}

export default async function SvetnikPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = await getSvetnikBySlug(slug)
  if (!s) notFound()

  const foto = s.fotografija
  const poudarki = (s.poudarki ?? []).filter((p) => p.besedilo)

  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-4xl">
        <Link href="/lokalne-volitve" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Nazaj na lokalne volitve
        </Link>

        <div className="mt-6 grid items-start gap-8 md:grid-cols-[260px_1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-line bg-cloud shadow-card">
            {foto?.url ? (
              <Image src={foto.url} alt={foto.alt || s.imePriimek} fill priority className="object-cover" sizes="260px" />
            ) : (
              <div className="flex h-full items-center justify-center text-navy/25">
                <User className="h-16 w-16" strokeWidth={1.3} />
              </div>
            )}
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              Kandidat za občinski svet
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{s.imePriimek}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {s.poklic && <span>{s.poklic}</span>}
              {s.kraj && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-teal" strokeWidth={2} /> {s.kraj}
                </span>
              )}
            </div>
            {s.predstavitev ? (
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-navy/90">{s.predstavitev}</p>
            ) : s.kratekOpis ? (
              <p className="mt-5 text-base leading-relaxed text-navy/90">{s.kratekOpis}</p>
            ) : null}
          </div>
        </div>

        {/* Poudarki */}
        {poudarki.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-navy">Zakaj kandidiram</h2>
            <ul className="mt-5 space-y-3">
              {poudarki.map((p, i) => (
                <li key={i} className="flex items-start gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-card">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm text-navy/90">{p.besedilo}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pobuda CTA */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-navy p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Imaš pobudo za svoj kraj?</h3>
            <p className="mt-1 text-sm text-white/70">Oddaj pobudo – pregledamo jo in po potrebi vključimo v program.</p>
          </div>
          <Button href="/pobude" variant="teal" className="shrink-0">
            <Send className="h-4 w-4" strokeWidth={2} /> Oddaj pobudo
          </Button>
        </div>

        {/* Sporočilo kandidatu */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-navy">Pošlji sporočilo kandidatu</h2>
          <p className="mt-2 text-sm text-muted">Vprašanje ali predlog za {s.imePriimek}? Piši mu/ji.</p>
          <div className="mt-5">
            <SimpleForm
              action="/lokalne-volitve/kontakt"
              hidden={{ vir: 'svetnik', prejemnik: s.imePriimek, svetnikEmail: s.email || '' }}
              submitLabel="Pošlji sporočilo"
              successTitle="Sporočilo poslano!"
              successText="Hvala za sporočilo. Kandidat se bo oglasil v najkrajšem možnem času."
              fields={[
                { name: 'imePriimek', label: 'Ime in priimek', required: true },
                { name: 'email', label: 'E-pošta', type: 'email', required: true },
                { name: 'telefon', label: 'Telefon', type: 'tel' },
                { name: 'sporocilo', label: 'Sporočilo', type: 'textarea', required: true },
              ]}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
