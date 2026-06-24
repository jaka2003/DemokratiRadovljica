import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Container } from '@/components/site/Container'
import { Klepet } from '@/components/klepet/Klepet'
import { isAdmin } from '@/access/roles'
import { imeUporabnika } from '@/lib/klepet-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Klepet ekipe' }

export default async function KlepetPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')

  return (
    <section className="py-8 lg:py-10">
      <Container className="max-w-5xl">
        <Klepet
          jaz={{ id: Number(user.id), ime: imeUporabnika(user as unknown as Record<string, unknown>) }}
          admin={isAdmin(user)}
        />
      </Container>
    </section>
  )
}
