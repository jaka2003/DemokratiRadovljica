import Image from 'next/image'
import { User } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { ComingSoon } from '@/components/site/ComingSoon'
import { Icon } from '@/lib/icons'
import type { IconName } from '@/lib/site'
import SimpleForm from '@/components/forms/SimpleForm'
import { NoviceMini } from '@/components/site/NoviceMini'
import { getKandidat, getNoviceKandidat } from '@/lib/queries'

export const metadata = { title: 'Kandidat/-ka za župana/-jo' }
export const dynamic = 'force-dynamic'

type Vrednota = { label: string; ikona: string }

// Pretvori YouTube/Vimeo povezavo v vdelano (embed) obliko.
function embedUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export default async function KandidatPage() {
  const k = await getKandidat()

  if (!k?.objavljeno) {
    return (
      <ComingSoon
        title="Kandidat/-ka za župana/-jo"
        description="Stran kandidata bo objavljena, ko bo kandidat oziroma kandidatka uradno predstavljen/-a."
      />
    )
  }

  const foto = k.fotografija as { url?: string; alt?: string } | undefined
  const vrednote = (k.vrednote as Vrednota[]) || []
  const video = embedUrl(String(k.videoUrl || ''))
  const objave = await getNoviceKandidat()

  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-4xl">
        {/* Uvod */}
        <div className="grid items-center gap-8 md:grid-cols-[280px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line bg-cloud shadow-card">
            {foto?.url ? (
              <Image src={foto.url} alt={foto.alt || String(k.imePriimek || 'Kandidat')} fill priority className="object-cover" sizes="280px" />
            ) : (
              <div className="flex h-full items-center justify-center text-navy/30">
                <User className="h-16 w-16" strokeWidth={1.3} />
              </div>
            )}
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              Kandidat za župana
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">{String(k.imePriimek || '')}</h1>
            {k.nagovor ? <p className="mt-4 text-lg leading-relaxed text-navy/90">{String(k.nagovor)}</p> : null}
          </div>
        </div>

        {/* Izkušnje in pogled na razvoj */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {k.izkusnje ? (
            <div className="rounded-[var(--radius-card)] bg-sand p-7">
              <h2 className="text-lg font-bold text-navy">Izkušnje</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy/80">{String(k.izkusnje)}</p>
            </div>
          ) : null}
          {k.pogledNaRazvoj ? (
            <div className="rounded-[var(--radius-card)] bg-sand p-7">
              <h2 className="text-lg font-bold text-navy">Pogled na razvoj občine</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy/80">{String(k.pogledNaRazvoj)}</p>
            </div>
          ) : null}
        </div>

        {/* Vrednote */}
        {vrednote.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-navy">Glavne vrednote</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {vrednote.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cloud text-teal">
                    <Icon name={(v.ikona as IconName) || 'shieldCheck'} className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-navy">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video nagovor */}
        {video && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-navy">Video nagovor</h2>
            <div className="mt-5 aspect-video overflow-hidden rounded-[var(--radius-card)] border border-line shadow-card">
              <iframe src={video} title="Video nagovor" allowFullScreen className="h-full w-full" />
            </div>
          </div>
        )}

        {/* Aktualne objave kandidata */}
        <NoviceMini novice={objave} naslov="Aktualne objave" />

        {/* Kontaktni obrazec */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-navy">Stopi v stik</h2>
          <p className="mt-2 text-sm text-muted">Vprašanje ali predlog za kandidata? Piši nam.</p>
          <div className="mt-5">
            <SimpleForm
              action="/kandidat/kontakt"
              submitLabel="Pošlji sporočilo"
              successTitle="Sporočilo poslano!"
              successText="Hvala za sporočilo. Odgovorimo v najkrajšem možnem času."
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
