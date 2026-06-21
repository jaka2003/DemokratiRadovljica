import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, User, Users } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'
import { getNastavitve, getKandidat, getSvetniki } from '@/lib/queries'

export const metadata = {
  title: 'Lokalne volitve 2026',
  description: 'Kandidat za župana in lista kandidatov za občinski svet – Demokrati Radovljica, lokalne volitve 2026.',
}
export const dynamic = 'force-dynamic'

export default async function LokalneVolitvePage() {
  const [nastavitve, kandidat, svetniki] = await Promise.all([getNastavitve(), getKandidat(), getSvetniki()])
  const zupanMode = (nastavitve?.tipVolitev ?? 'zupan_lista') === 'zupan_lista'
  const foto = kandidat?.fotografija as { url?: string; alt?: string } | undefined

  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Lokalne volitve 2026
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">Naši kandidati</h1>
          <p className="mt-3 text-muted">
            {zupanMode
              ? 'Kandidat za župana in lista kandidatov za občinski svet občine Radovljica.'
              : 'Lista kandidatov za občinski svet občine Radovljica.'}
          </p>
        </div>

        {/* Kandidat za župana (2-stolpčni blok) */}
        {zupanMode &&
          (kandidat?.objavljeno ? (
            <div className="mt-12 grid items-center gap-8 rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card md:grid-cols-2 lg:p-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Kandidat za župana</span>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy">{String(kandidat.imePriimek || '')}</h2>
                {kandidat.nagovor ? (
                  <p className="mt-3 line-clamp-5 text-base leading-relaxed text-navy/85">{String(kandidat.nagovor)}</p>
                ) : null}
                <div className="mt-6">
                  <Button href="/lokalne-volitve/zupan" variant="primary">
                    Spoznaj kandidata <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
              <div className="relative order-first aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-cloud md:order-last">
                {foto?.url ? (
                  <Image src={foto.url} alt={foto.alt || String(kandidat.imePriimek || 'Kandidat')} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-navy/25">
                    <User className="h-20 w-20" strokeWidth={1.2} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-12 rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-8 text-center text-muted">
              Kandidat za župana bo predstavljen kmalu.
            </div>
          ))}

        {/* Kandidati za svetnike (lista) */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-navy">Kandidati za občinski svet</h2>
          {svetniki.length === 0 ? (
            <div className="mt-6 flex items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-6 text-muted">
              <Users className="h-6 w-6" strokeWidth={1.5} /> Lista kandidatov bo objavljena kmalu.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {svetniki.map((s) => {
                const sf = s.fotografija
                return (
                  <Link
                    key={s.id}
                    href={`/lokalne-volitve/${s.slug}`}
                    className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-card-hover"
                  >
                    <div className="relative aspect-[4/5] bg-cloud">
                      {sf?.url ? (
                        <Image src={sf.url} alt={sf.alt || s.imePriimek} fill className="object-cover" sizes="(max-width:640px) 50vw, 25vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-navy/20">
                          <User className="h-10 w-10" strokeWidth={1.3} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-bold leading-snug text-navy">{s.imePriimek}</div>
                      {s.poklic && <div className="mt-0.5 text-xs text-muted">{s.poklic}</div>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
