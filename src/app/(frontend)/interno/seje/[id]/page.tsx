import { redirect, notFound } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowLeft, Clock, FileText, BarChart3 } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { GlasovanjeTocke } from '@/components/seje/GlasovanjeTocke'
import { resolveUdelezenci, morebitenZakljucek } from '@/lib/seje-server'
import { statusLabel } from '@/lib/seje'
import { isAdmin } from '@/access/roles'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dopisna seja' }

type Media = { url?: string; filename?: string }
const mediaList = (arr: unknown): { url: string; filename: string }[] =>
  (Array.isArray(arr) ? (arr as Media[]) : [])
    .filter((m) => m && m.url)
    .map((m) => ({ url: m.url as string, filename: m.filename || 'dokument' }))

export default async function SejaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')

  let seja: Record<string, unknown>
  try {
    seja = (await payload.findByID({ collection: 'seje', id, depth: 1, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    notFound()
  }

  const admin = isAdmin(user)
  const udelezenci = await resolveUdelezenci(payload, seja)
  const jeUdelezenec = udelezenci.some((u) => String(u.id) === String(user.id))

  if (!jeUdelezenec && !admin) {
    return (
      <section className="py-12 lg:py-16">
        <Container className="max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-navy">Nimate dostopa do te seje</h1>
          <p className="mt-2 text-muted">Niste med povabljenimi udeleženci te dopisne seje.</p>
          <Link href="/interno/seje" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
            <ArrowLeft className="h-4 w-4" /> Nazaj na seznam sej
          </Link>
        </Container>
      </section>
    )
  }

  const status = await morebitenZakljucek(payload, seja, udelezenci)
  const poRoku = seja.rokGlasovanja ? Date.now() > new Date(seja.rokGlasovanja as string).getTime() : false
  const odprto = status === 'v_teku' && jeUdelezenec && !poRoku

  const mojiRes = await payload.find({
    collection: 'glasovi',
    where: { and: [{ seja: { equals: id } }, { uporabnik: { equals: user.id } }] },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })
  const zeGlasovano: Record<string, string> = {}
  for (const g of mojiRes.docs as { tockaId: string; glas: string }[]) zeGlasovano[String(g.tockaId)] = g.glas

  const tocke = ((Array.isArray(seja.tocke) ? seja.tocke : []) as Record<string, unknown>[]).map((t) => ({
    id: String(t.id),
    naslov: String(t.naslov || ''),
    opis: (t.opis as string) || '',
    gradivo: (t.gradivo as string) || '',
    priloge: mediaList(t.priloge),
    dodatni: mediaList(t.dodatniDokumenti),
  }))
  const gradivo = mediaList(seja.gradivo)
  const rok = seja.rokGlasovanja
    ? new Date(seja.rokGlasovanja as string).toLocaleString('sl-SI', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Europe/Ljubljana',
      })
    : ''

  return (
    <section className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <Link
          href="/interno/seje"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Vse seje
        </Link>

        <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
              {statusLabel(status)}
            </span>
            {seja.stevilka ? <span className="text-xs text-muted">{String(seja.stevilka)}</span> : null}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{String(seja.naslov)}</h1>
          {rok && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-navy/80">
              <Clock className="h-4 w-4 text-teal" strokeWidth={2} /> Rok za glasovanje: {rok}
            </p>
          )}
          {seja.opis ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-navy/85">{String(seja.opis)}</p>
          ) : null}

          {gradivo.length > 0 && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-sm font-semibold text-navy">Gradivo seje</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {gradivo.map((p, j) => (
                  <a
                    key={j}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-cloud px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-teal"
                  >
                    <FileText className="h-3.5 w-3.5 text-teal" strokeWidth={2} /> {p.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          {admin && (
            <Link
              href={`/interno/seje/${id}/porocilo`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700"
            >
              <BarChart3 className="h-4 w-4" strokeWidth={2} /> Rezultati in poročilo
            </Link>
          )}
        </div>

        <h2 className="mt-8 text-lg font-bold text-navy">Točke dnevnega reda</h2>
        {!jeUdelezenec && admin && (
          <p className="mt-1 text-sm text-amber-700">
            Sejo si ogledujete kot administrator (niste udeleženec, zato ne morete glasovati).
          </p>
        )}
        <div className="mt-4">
          <GlasovanjeTocke sejaId={id} tocke={tocke} zeGlasovano={zeGlasovano} odprto={odprto} />
        </div>
      </Container>
    </section>
  )
}
