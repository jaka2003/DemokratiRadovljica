import { Container } from '@/components/site/Container'
import { Icon } from '@/lib/icons'
import { IDENTITY } from '@/lib/site'

// 3.3 Predstavitev Demokratov Radovljica – kratek blok + 3 vrednote.
export function Identity() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy">{IDENTITY.title}</h2>
          <p className="mt-3 text-lg text-muted">{IDENTITY.description}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {IDENTITY.values.map((v) => (
            <div
              key={v.label}
              className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] bg-sand p-7 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-teal shadow-card">
                <Icon name={v.icon} className="h-6 w-6" />
              </span>
              <span className="text-base font-semibold text-navy">{v.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
