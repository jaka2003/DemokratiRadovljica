import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Container } from '@/components/site/Container'
import PlakatModul from '@/components/plakat/PlakatModul'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Predlagaj plakatno mesto' }

export default async function PlakatPage() {
  // Samo za prijavljene (kandidati/člani). Sicer preusmeri na prijavo.
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')

  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Interno
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">Predlagaj plakatno mesto</h1>
          <p className="mt-3 text-muted">
            Označi lokacijo na zemljevidu (ali uporabi svojo lokacijo), dodaj fotografijo in pošlji predlog za
            postavitev plakata. Predlog pregleda ekipa kampanje.
          </p>
        </div>

        <div className="mt-12">
          <PlakatModul />
        </div>
      </Container>
    </section>
  )
}
