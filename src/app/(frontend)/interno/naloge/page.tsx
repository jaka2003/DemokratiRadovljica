import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { DodeliNaloge } from '@/components/naloge/DodeliNaloge'
import { isAdmin } from '@/access/roles'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dodeli naloge' }

export default async function DodeliNalogePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')
  if (!isAdmin(user)) redirect('/admin')

  return (
    <section className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Nazaj v administracijo
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cloud text-teal">
            <ClipboardList className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy">Dodeli naloge</h1>
            <p className="text-sm text-muted">Izberi ljudi (po vlogah) in jim dodeli nalogo – vsak dobi svojo + e-pošto.</p>
          </div>
        </div>

        <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-8">
          <DodeliNaloge />
        </div>
      </Container>
    </section>
  )
}
