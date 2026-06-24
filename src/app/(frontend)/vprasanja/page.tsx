import { getPayload } from 'payload'
import config from '@payload-config'
import { MessageCircleQuestion, MessagesSquare } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { ShareButtons } from '@/components/site/ShareButtons'
import { VprasanjeForm } from '@/components/vprasanja/VprasanjeForm'
import { ANONIMNI_AVTOR } from '@/lib/vprasanja'

export const dynamic = 'force-dynamic'

const NASLOV = 'Vprašanja občanov'
const OPIS =
  'Postavite vprašanje ekipi Demokratov Radovljica. Na izbrana vprašanja javno odgovorimo – odgovori koristijo vsem občanom.'

export const metadata = {
  title: NASLOV,
  description: OPIS,
  openGraph: { title: NASLOV, description: OPIS },
}

type Podrocje = { naslov?: string; slug?: string }
type Vprasanje = {
  id: string | number
  vprasanje: string
  odgovor?: string
  imeObcana?: string
  prikaziIme?: boolean
  createdAt?: string
  povezanoPodrocje?: Podrocje | null
}

export default async function VprasanjaPage() {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'vprasanja',
    where: { and: [{ objavljeno: { equals: true } }, { odgovor: { exists: true } }] },
    sort: '-createdAt',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })
  const vprasanja = (res.docs as Vprasanje[]).filter((v) => (v.odgovor || '').trim().length > 0)

  const faqLd =
    vprasanja.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: vprasanja.map((v) => ({
            '@type': 'Question',
            name: v.vprasanje,
            acceptedAnswer: { '@type': 'Answer', text: v.odgovor },
          })),
        }
      : null

  const avtor = (v: Vprasanje) => (v.prikaziIme && v.imeObcana ? v.imeObcana : ANONIMNI_AVTOR)
  const datum = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Ljubljana' })
      : ''

  return (
    <section className="py-12 lg:py-16">
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Sodeluj
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">{NASLOV}</h1>
          <p className="mt-3 text-muted">{OPIS}</p>
          <div className="mt-5 flex justify-center">
            <ShareButtons title={`${NASLOV} – Demokrati Radovljica`} />
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[1fr_minmax(360px,420px)] lg:items-start">
          {/* Seznam objavljenih vprašanj in odgovorov */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
              <MessagesSquare className="h-5 w-5 text-teal" strokeWidth={2} /> Odgovorjena vprašanja
            </h2>

            {vprasanja.length === 0 ? (
              <div className="mt-5 rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-10 text-center text-muted">
                Še ni objavljenih odgovorov. Bodite prvi, ki postavi vprašanje – desno. 👉
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {vprasanja.map((v) => (
                  <article key={String(v.id)} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-card sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                        V
                      </span>
                      <h3 className="text-base font-bold text-navy sm:text-lg">{v.vprasanje}</h3>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">
                        O
                      </span>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-navy/85">{v.odgovor}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line pt-3 text-xs text-muted">
                      {v.povezanoPodrocje?.naslov && (
                        <span className="rounded-full bg-teal/10 px-2.5 py-0.5 font-semibold text-teal-700">
                          {v.povezanoPodrocje.naslov}
                        </span>
                      )}
                      <span>Vprašal/-a: {avtor(v)}</span>
                      {v.createdAt && <span>• {datum(v.createdAt)}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Obrazec za novo vprašanje */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-700">
              <MessageCircleQuestion className="h-5 w-5" strokeWidth={2} /> Postavi vprašanje
            </div>
            <VprasanjeForm />
          </div>
        </div>
      </Container>
    </section>
  )
}
