import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Icon } from '@/lib/icons'
import { PARTICIPATE } from '@/lib/site'

// 3.7 Zaključni blok – čist poziv k sodelovanju (3 kartice).
export function Participate() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy">{PARTICIPATE.title}</h2>
          <p className="mt-3 text-muted">{PARTICIPATE.subtitle}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PARTICIPATE.cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-navy p-8 text-white transition-all hover:-translate-y-0.5 hover:bg-navy-800"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                <Icon name={card.icon} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="mt-1 text-sm text-white/70">{card.subtitle}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-teal">
                Naprej
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
