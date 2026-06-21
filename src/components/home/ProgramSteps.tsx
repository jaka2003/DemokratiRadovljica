import { Container } from '@/components/site/Container'
import { Icon } from '@/lib/icons'
import { PROGRAM_STEPS } from '@/lib/site'

// 3.4 Kako nastaja program – 5 korakov v vrstici s povezovalno črto.
export function ProgramSteps({ koraki }: { koraki?: { naslov?: string }[] }) {
  const steps =
    koraki && koraki.length > 0
      ? koraki.map((k, i) => ({
          number: i + 1,
          title: k.naslov || '',
          icon: PROGRAM_STEPS[i]?.icon || 'flag',
        }))
      : PROGRAM_STEPS
  return (
    <section className="bg-cloud py-14 lg:py-20">
      <Container>
        <h2 className="text-center text-3xl font-bold tracking-tight text-navy">Kako nastaja program</h2>

        <div className="relative mt-12">
          {/* Povezovalna črta (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-line lg:block" aria-hidden="true" />

          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {steps.map((step) => (
              <li key={step.number} className="relative flex flex-col items-center text-center">
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-teal shadow-card">
                  <Icon name={step.icon} className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {step.number}
                  </span>
                </span>
                <span className="mt-4 max-w-[10rem] text-sm font-semibold leading-snug text-navy">
                  {step.title}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
