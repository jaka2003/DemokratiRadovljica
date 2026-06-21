import Image from 'next/image'
import { Mail, Phone, MapPin, Users } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Icon } from '@/lib/icons'
import type { IconName } from '@/lib/site'
import SimpleForm from '@/components/forms/SimpleForm'
import { getNastavitve, getEkipa } from '@/lib/queries'

export const metadata = {
  title: 'Demokrati Radovljica',
  description: 'Lokalna ekipa Demokrati Radovljica – poslanstvo, vrednote, ekipa in možnost sodelovanja.',
}

export const dynamic = 'force-dynamic'

type Vrednota = { label: string; ikona: string }
type Omrezje = { platforma: string; url: string }

export default async function DemokratiPage() {
  const [n, ekipa] = await Promise.all([getNastavitve(), getEkipa()])
  const vrednote = (n.vrednote as Vrednota[]) || []
  const omrezja = (n.druzbenaOmrezja as Omrezje[]) || []

  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Lokalna ekipa
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">Demokrati Radovljica</h1>
          <p className="mt-3 text-lg text-muted">Lokalna ekipa za odgovorno, pregledno in razvojno občino.</p>
          {n.strankaUrl ? (
            <a
              href={String(n.strankaUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
            >
              Del stranke Demokrati → spoznaj stranko
            </a>
          ) : null}
        </div>

        {/* Poslanstvo in način dela */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {n.poslanstvo ? (
            <div className="rounded-[var(--radius-card)] bg-sand p-7">
              <h2 className="text-lg font-bold text-navy">Poslanstvo</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy/80">{String(n.poslanstvo)}</p>
            </div>
          ) : null}
          {n.nacinDela ? (
            <div className="rounded-[var(--radius-card)] bg-sand p-7">
              <h2 className="text-lg font-bold text-navy">Način dela</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy/80">{String(n.nacinDela)}</p>
            </div>
          ) : null}
        </div>

        {/* Vrednote */}
        {vrednote.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {vrednote.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white p-6 text-center shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cloud text-teal">
                  <Icon name={(v.ikona as IconName) || 'shieldCheck'} className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold text-navy">{v.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ekipa */}
        {ekipa.length > 0 && (
          <div className="mt-16">
            <h2 className="text-center text-2xl font-bold tracking-tight text-navy">Naša ekipa</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ekipa.map((c) => (
                <div key={c.id} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card">
                  <div className="relative aspect-square bg-cloud">
                    {c.fotografija?.url ? (
                      <Image src={c.fotografija.url} alt={c.fotografija.alt || c.ime} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-navy/30">
                        <Users className="h-10 w-10" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-navy">{c.ime}</h3>
                    {c.funkcija && <p className="text-sm text-teal-700">{c.funkcija}</p>}
                    {c.opis && <p className="mt-2 text-sm text-muted">{c.opis}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kontakt + družbena omrežja + prijava */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">Kontakt</h2>
            <ul className="mt-5 space-y-3 text-sm text-navy/85">
              {n.email ? (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-teal" strokeWidth={2} />
                  <a href={`mailto:${n.email}`} className="hover:text-teal">{String(n.email)}</a>
                </li>
              ) : null}
              {n.telefon ? (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-teal" strokeWidth={2} /> {String(n.telefon)}
                </li>
              ) : null}
              {n.naslov ? (
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-teal" strokeWidth={2} /> {String(n.naslov)}
                </li>
              ) : null}
            </ul>
            {omrezja.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {omrezja.map((o, i) => (
                  <a key={i} href={o.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-4 py-2 text-sm font-medium capitalize text-navy transition-colors hover:border-teal hover:text-teal">
                    {o.platforma}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">Pridruži se</h2>
            <p className="mt-2 text-sm text-muted">Postani del ekipe. Pusti svoje podatke in oglasimo se ti.</p>
            <div className="mt-5">
              <SimpleForm
                action="/demokrati/prijava"
                submitLabel="Pošlji prijavo"
                successTitle="Hvala za prijavo!"
                successText="Kmalu se ti oglasimo."
                gdprLabel="Soglašam z obdelavo osebnih podatkov za namen sodelovanja."
                fields={[
                  { name: 'imePriimek', label: 'Ime in priimek', required: true },
                  { name: 'email', label: 'E-pošta', type: 'email', required: true },
                  { name: 'telefon', label: 'Telefon', type: 'tel' },
                  { name: 'kraj', label: 'Kraj' },
                  { name: 'podrocja', label: 'Področja sodelovanja', full: true },
                  { name: 'sporocilo', label: 'Sporočilo', type: 'textarea' },
                ]}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
