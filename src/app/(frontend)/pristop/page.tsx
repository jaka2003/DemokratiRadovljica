import { UserPlus } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { PristopForm } from '@/components/pristop/PristopForm'

export const dynamic = 'force-dynamic'

const NASLOV = 'Pridruži se – pristopna izjava'
const OPIS = 'Postani član Demokratov Radovljica. Izpolni pristopno izjavo, prošnjo bomo pregledali in te obvestili.'

export const metadata = {
  title: 'Pridruži se',
  description: OPIS,
  openGraph: { title: NASLOV, description: OPIS },
}

export default function PristopPage() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-2xl">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cloud text-teal">
            <UserPlus className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">Pristopna izjava</h1>
          <p className="mt-3 text-muted">{OPIS}</p>
        </div>

        <div className="mt-10">
          <PristopForm />
        </div>
      </Container>
    </section>
  )
}
