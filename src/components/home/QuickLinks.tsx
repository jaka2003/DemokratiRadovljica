import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Icon } from '@/lib/icons'
import { QUICK_LINKS } from '@/lib/site'

// 3.2 Hitre povezave do podstrani – vrstica klikabilnih kartic.
export function QuickLinks() {
  return (
    <section className="py-8 lg:-mt-8">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cloud text-navy transition-colors group-hover:bg-teal/10 group-hover:text-teal">
                <Icon name={card.icon} className="h-5 w-5" />
              </span>
              <span className="flex items-start justify-between gap-1 text-sm font-semibold leading-snug text-navy">
                {card.title}
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-line transition-colors group-hover:text-teal" />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
