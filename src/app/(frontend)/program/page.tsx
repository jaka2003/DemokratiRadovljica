import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Icon } from '@/lib/icons'
import type { IconName } from '@/lib/site'
import { getProgramskaPodrocja } from '@/lib/queries'

export const metadata = {
  title: 'Program',
  description:
    'Programska področja Demokratov Radovljica – konkretni ukrepi za razvoj, preglednost in kakovostno življenje v občini.',
}

export const dynamic = 'force-dynamic'

export default async function ProgramPage() {
  const podrocja = await getProgramskaPodrocja()

  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Program
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">Naš program</h1>
          <p className="mt-3 text-muted">
            Konkretne rešitve po področjih – nastajajo iz resničnih potreb krajev in ljudi. Klikni na
            področje za podrobnosti in povezane pobude občanov.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {podrocja.map((p) => (
            <Link
              key={p.id}
              href={`/program/${p.slug}`}
              className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cloud text-navy transition-colors group-hover:bg-teal/10 group-hover:text-teal">
                <Icon name={p.ikona as IconName} className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-navy">{p.naslov}</h2>
              {p.kratekOpis && <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{p.kratekOpis}</p>}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                Več
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
