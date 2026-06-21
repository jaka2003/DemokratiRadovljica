import { MapPin, Send, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'

// 3.6 Pobude občanov in zemljevid – na začetni strani prikazano kot enoten predogled.
// Polni interaktivni zemljevid in obrazec se zgradita v ločeni fazi (/pobude).
export function PobudePreview() {
  return (
    <section className="bg-cloud py-14 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy">Pobude občanov in zemljevid</h2>
          <p className="mt-3 text-muted">
            Predlagaj rešitev za svoj kraj. Odobrene pobude se anonimizirano prikažejo na zemljevidu občine.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
          {/* Leva polovica: zemljevid (predogled) */}
          <div className="relative min-h-[320px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card">
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(15,0,78,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,0,78,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent" />
            {/* Označbe pobud */}
            <span className="absolute left-[28%] top-[35%] text-teal"><MapPin className="h-7 w-7 drop-shadow" fill="currentColor" /></span>
            <span className="absolute left-[58%] top-[55%] text-navy"><MapPin className="h-6 w-6 drop-shadow" fill="currentColor" /></span>
            <span className="absolute left-[44%] top-[24%] text-teal-600"><MapPin className="h-5 w-5 drop-shadow" fill="currentColor" /></span>
            <span className="absolute left-[70%] top-[30%] text-navy-700"><MapPin className="h-6 w-6 drop-shadow" fill="currentColor" /></span>
            <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-navy shadow-card backdrop-blur">
              Interaktivni zemljevid občine Radovljica
            </div>
          </div>

          {/* Desna polovica: poziv k oddaji pobude */}
          <div className="flex flex-col justify-center rounded-[var(--radius-card)] border border-line bg-white p-8 shadow-card">
            <h3 className="text-xl font-bold text-navy">Imaš predlog za svoj kraj?</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Oddaj pobudo glede cest, pločnikov, parkirišč, razsvetljave, igrišč ali drugih tem.
              Vsako pobudo pregledamo in po potrebi vključimo v program.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-navy/80">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-teal" strokeWidth={2} /> Označi točno lokacijo na zemljevidu
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-teal" strokeWidth={2} /> Tvoji osebni podatki ostanejo zasebni
              </li>
            </ul>
            <div className="mt-7">
              <Button href="/pobude" variant="teal">
                <Send className="h-4 w-4" strokeWidth={2} />
                Oddaj pobudo
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
