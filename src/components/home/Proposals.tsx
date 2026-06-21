import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Icon } from '@/lib/icons'
import { PROPOSALS } from '@/lib/site'

// 3.5 Naši prvi konkretni predlogi – mreža 10 kartic.
export function Proposals() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy">Naši prvi konkretni predlogi</h2>
          <p className="mt-3 text-muted">Rešitve, ki nastajajo iz resničnih potreb krajev in ljudi.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PROPOSALS.map((p) => (
            <Link
              key={p.number}
              href={p.href}
              className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cloud text-navy transition-colors group-hover:bg-teal/10 group-hover:text-teal">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <span className="text-2xl font-extrabold text-line transition-colors group-hover:text-teal/30">
                  {String(p.number).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold leading-snug text-navy">{p.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">{p.subtitle}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 opacity-0 transition-opacity group-hover:opacity-100">
                Več v programu
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
