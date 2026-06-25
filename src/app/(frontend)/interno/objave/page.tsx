import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Megaphone } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { DeljiveObjave, type Objava } from '@/components/objave/DeljiveObjave'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Deli objave' }

export default async function ObjavePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')

  const privzetaPovezava = process.env.NEXT_PUBLIC_SERVER_URL || 'https://demokratiradovljica.com'

  const res = await payload.find({
    collection: 'deljive-objave',
    where: { objavljeno: { equals: true } },
    sort: 'vrstniRed',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })

  const objave: Objava[] = (res.docs as Record<string, unknown>[]).map((o) => {
    const slika = o.slika as { url?: string; filename?: string } | null | undefined
    return {
      id: o.id as string | number,
      naslov: String(o.naslov || ''),
      platforma: String(o.platforma || 'splosno'),
      besedilo: String(o.besedilo || ''),
      besediloKratko: String(o.besediloKratko || ''),
      slikaUrl: slika?.url || '',
      slikaIme: slika?.filename || '',
      povezava: String(o.povezava || '') || privzetaPovezava,
      hashtagi: String(o.hashtagi || ''),
    }
  })

  return (
    <section className="py-10 lg:py-14">
      <Container className="max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cloud text-teal">
            <Megaphone className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy">Pomagaj širiti program</h1>
            <p className="text-sm text-muted">Pripravljene objave – kopiraj besedilo, prenesi sliko in deli.</p>
          </div>
        </div>

        <div className="mt-8">
          {objave.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-10 text-center text-muted">
              Trenutno ni pripravljenih objav. Uredniki jih dodajo v »Deljive objave«.
            </div>
          ) : (
            <DeljiveObjave objave={objave} />
          )}
        </div>
      </Container>
    </section>
  )
}
