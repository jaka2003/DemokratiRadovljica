import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Vote, ArrowRight, Clock } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { isAdmin } from '@/access/roles'
import { statusLabel } from '@/lib/seje'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dopisne seje' }

const STATUS_BARVA: Record<string, { bg: string; c: string }> = {
  osnutek: { bg: '#f1f2f6', c: '#5b5f73' },
  pripravljena: { bg: '#eef2ff', c: '#3730a3' },
  v_teku: { bg: '#e6fbfb', c: '#008288' },
  zakljucena: { bg: '#e8f8ee', c: '#157a43' },
}

export default async function SejeListPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')

  const admin = isAdmin(user)
  const vloge = Array.isArray(user.vloga) ? (user.vloga as string[]) : user.vloga ? [String(user.vloga)] : []
  const where = admin
    ? {}
    : {
        or: [
          { udelezenci: { in: [user.id] } },
          ...(vloge.length ? [{ skupine: { in: vloge } }] : []),
        ],
      }

  const res = await payload.find({
    collection: 'seje',
    where: where as never,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const seje = res.docs as Record<string, unknown>[]

  return (
    <section className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cloud text-teal">
            <Vote className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy">Dopisne seje</h1>
            <p className="text-sm text-muted">Elektronsko glasovanje o točkah dnevnega reda.</p>
          </div>
        </div>

        {seje.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-10 text-center text-muted">
            Trenutno ni nobene seje za vas.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {seje.map((s) => {
              const st = String(s.status || 'osnutek')
              const b = STATUS_BARVA[st] || STATUS_BARVA.osnutek
              const rok = s.rokGlasovanja
                ? new Date(s.rokGlasovanja as string).toLocaleString('sl-SI', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'Europe/Ljubljana',
                  })
                : ''
              return (
                <Link
                  key={String(s.id)}
                  href={`/interno/seje/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-card transition-colors hover:border-teal"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: b.bg, color: b.c }}
                      >
                        {statusLabel(st)}
                      </span>
                      {s.stevilka ? <span className="text-xs text-muted">{String(s.stevilka)}</span> : null}
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold text-navy">{String(s.naslov)}</h3>
                    {rok && (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                        <Clock className="h-4 w-4 text-teal" strokeWidth={2} /> Rok: {rok}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-teal" strokeWidth={2} />
                </Link>
              )
            })}
          </div>
        )}
      </Container>
    </section>
  )
}
