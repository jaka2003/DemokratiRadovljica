import { redirect, notFound } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { NatisniGumb } from '@/components/seje/NatisniGumb'
import { resolveUdelezenci, morebitenZakljucek } from '@/lib/seje-server'
import { izracunajRezultat, statusLabel } from '@/lib/seje'
import { isAdmin } from '@/access/roles'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Poročilo seje' }

const dt = (v: unknown) =>
  v
    ? new Date(v as string).toLocaleString('sl-SI', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Ljubljana' })
    : '—'

export default async function PorociloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')
  if (!isAdmin(user)) redirect('/interno/seje')

  let seja: Record<string, unknown>
  try {
    seja = (await payload.findByID({ collection: 'seje', id, depth: 0, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    notFound()
  }

  const udelezenci = await resolveUdelezenci(payload, seja)
  const status = await morebitenZakljucek(payload, seja, udelezenci)
  const glasoviRes = await payload.find({
    collection: 'glasovi',
    where: { seja: { equals: id } },
    limit: 5000,
    depth: 0,
    overrideAccess: true,
  })
  const glasovi = glasoviRes.docs as { tockaId: string; uporabnik: unknown; glas: string }[]
  const uid = (g: { uporabnik: unknown }) =>
    String(g.uporabnik && typeof g.uporabnik === 'object' ? (g.uporabnik as { id: unknown }).id : g.uporabnik)

  const tockeSrc = (Array.isArray(seja.tocke) ? seja.tocke : []) as { id: string; naslov: string }[]
  const tocke = tockeSrc.map((t) => {
    const gt = glasovi.filter((g) => String(g.tockaId) === String(t.id))
    const r = izracunajRezultat(gt, udelezenci.length)
    const glasovaliIds = new Set(gt.map(uid))
    return {
      naslov: t.naslov,
      ...r,
      kdoNi: udelezenci.filter((u) => !glasovaliIds.has(String(u.id))).map((u) => u.ime),
    }
  })

  const skupnaUdelezba =
    udelezenci.length > 0 && tocke.length > 0
      ? Math.round((tocke.reduce((s, t) => s + t.skupaj, 0) / (udelezenci.length * tocke.length)) * 100)
      : 0

  return (
    <section className="py-10 lg:py-14">
      {/* Pri tiskanju skrijemo glavo/nogo strani in nepotrebne gumbe. */}
      <style>{`@media print { header, footer, .no-print { display: none !important } body { background: #fff } main { padding: 0 } }`}</style>
      <Container className="max-w-3xl">
        <div className="no-print mb-5 flex items-center justify-between gap-3">
          <Link
            href={`/interno/seje/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Nazaj na sejo
          </Link>
          <NatisniGumb />
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Poročilo o dopisni seji</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{String(seja.naslov)}</h1>
          {seja.stevilka ? <p className="mt-1 text-sm text-muted">{String(seja.stevilka)}</p> : null}

          {/* Osnovni podatki */}
          <div className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <Row label="Status" value={statusLabel(status)} />
            <Row label="Rok glasovanja" value={dt(seja.rokGlasovanja)} />
            <Row label="Ustvarjeno" value={dt(seja.createdAt)} />
            <Row label="Zaključeno" value={status === 'zakljucena' ? dt(seja.zakljucenoOb) : '—'} />
            <Row label="Št. udeležencev" value={String(udelezenci.length)} />
            <Row label="Skupna udeležba" value={`${skupnaUdelezba} %`} />
          </div>

          {/* Udeleženci */}
          <div className="mt-6 border-t border-line pt-5">
            <h2 className="text-sm font-bold text-navy">Udeleženci ({udelezenci.length})</h2>
            <p className="mt-1 text-sm text-navy/80">{udelezenci.map((u) => u.ime).join(', ') || '—'}</p>
          </div>

          {/* Rezultati po točkah */}
          <div className="mt-6 border-t border-line pt-5">
            <h2 className="text-base font-bold text-navy">Rezultati glasovanja</h2>
            <div className="mt-4 space-y-4">
              {tocke.map((t, i) => (
                <div key={i} className="rounded-[var(--radius-card)] border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-navy">
                      {i + 1}. {t.naslov}
                    </h3>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        t.sprejet
                          ? { background: '#e8f8ee', color: '#157a43' }
                          : { background: '#fdecee', color: '#b00020' }
                      }
                    >
                      {t.sprejet ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {t.sprejet ? 'Sklep sprejet' : 'Sklep ni sprejet'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Pill label="ZA" value={t.za} c="#157a43" bg="#e8f8ee" />
                    <Pill label="PROTI" value={t.proti} c="#b00020" bg="#fdecee" />
                    <Pill label="VZDRŽAN" value={t.vzdrzan} c="#5b5f73" bg="#f1f2f6" />
                    <Pill label="Skupaj" value={t.skupaj} c="#0f004e" bg="#eef1f6" />
                    <Pill label="Udeležba" value={`${t.udelezba} %`} c="#008288" bg="#e6fbfb" />
                  </div>
                  {t.kdoNi.length > 0 && (
                    <p className="mt-2 text-xs text-muted">Ni glasovalo: {t.kdoNi.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line/60 py-1">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-navy">{value}</span>
    </div>
  )
}

function Pill({ label, value, c, bg }: { label: string; value: string | number; c: string; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold" style={{ background: bg, color: c }}>
      {label}: {value}
    </span>
  )
}
