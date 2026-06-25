import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { isAdmin } from '@/access/roles'
import { preveriEnoto, dvojneKandidature, type ListniKandidat } from '@/lib/liste'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Preverjanje kandidatnih list' }

const spolChip = (s: string) => {
  if (s === 'm') return { t: 'M', bg: '#e6f0ff', c: '#1d4ed8' }
  if (s === 'z') return { t: 'Ž', bg: '#fde7f3', c: '#be185d' }
  return { t: '?', bg: '#f1f2f6', c: '#5b5f73' }
}

export default async function ListePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')
  if (!isAdmin(user)) redirect('/admin')

  const res = await payload.find({
    collection: 'svetniki',
    sort: 'vrstniRed',
    limit: 500,
    depth: 1,
    overrideAccess: true,
  })

  const vsi: ListniKandidat[] = (res.docs as Record<string, unknown>[]).map((d) => {
    const up = d.uporabnik as Record<string, unknown> | null | undefined
    const povezan = !!up && typeof up === 'object'
    return {
      id: d.id as string | number,
      imePriimek: String(d.imePriimek || ''),
      spol: String(d.spol || ''),
      vrstniRed: Number(d.vrstniRed ?? 100),
      volilnaEnota: String(d.volilnaEnota || '').trim(),
      dokumentacijaOk: povezan ? (up as { statusDokumentacije?: string }).statusDokumentacije === 'popolno' : false,
      povezanZUporabnikom: povezan,
    }
  })

  const skupine = new Map<string, ListniKandidat[]>()
  const nerazporejeni: ListniKandidat[] = []
  for (const k of vsi) {
    if (!k.volilnaEnota) {
      nerazporejeni.push(k)
      continue
    }
    const arr = skupine.get(k.volilnaEnota) || []
    arr.push(k)
    skupine.set(k.volilnaEnota, arr)
  }
  const enote = [...skupine.keys()].sort((a, b) => a.localeCompare(b, 'sl')).map((e) => preveriEnoto(e, skupine.get(e)!))
  const dvojne = dvojneKandidature(vsi)

  const Badge = ({ ok, label }: { ok: boolean; label: string }) => (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={ok ? { background: '#e8f8ee', color: '#157a43' } : { background: '#fdecee', color: '#b00020' }}
    >
      {ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
      {label}
    </span>
  )

  return (
    <section className="py-10 lg:py-14">
      <Container className="max-w-4xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Nazaj v administracijo
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy">Preverjanje kandidatnih list</h1>
        <p className="mt-1.5 text-sm text-muted">
          Po volilnih enotah preverja spolno kvoto (najmanj 40 % vsakega spola) in izmeničnost v prvi polovici liste (ZLV, čl. 70a).
        </p>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚠️ To je pripomoček. Spol in volilno enoto vpišeš pri vsakem kandidatu v »Kandidati za svetnike«. Končno skladnost potrdi Občinska volilna komisija.
        </p>

        {/* Dvojne kandidature */}
        {dvojne.length > 0 && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-2 font-bold text-red-700">
              <AlertTriangle className="h-4 w-4" /> Možna dvojna kandidatura
            </p>
            <p className="mt-1 text-sm text-red-700">Ta imena se pojavijo večkrat: {dvojne.join(', ')}.</p>
          </div>
        )}

        {/* Nerazporejeni */}
        {nerazporejeni.length > 0 && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-800">Brez volilne enote ({nerazporejeni.length})</p>
            <p className="mt-1 text-sm text-amber-800">
              {nerazporejeni.map((k) => k.imePriimek).join(', ')} — vpiši jim volilno enoto.
            </p>
          </div>
        )}

        {enote.length === 0 && nerazporejeni.length === 0 && (
          <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-10 text-center text-muted">
            Ni kandidatov za svetnike. Dodaj jih v »Kandidati za svetnike« in vpiši spol ter volilno enoto.
          </div>
        )}

        {/* Pregled po enotah */}
        <div className="mt-6 space-y-4">
          {enote.map((e) => (
            <div key={e.enota} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-navy">{e.enota}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge ok={e.kvotaOk} label="Kvota 40 %" />
                  <Badge ok={e.izmenicnostOk} label="Izmeničnost" />
                </div>
              </div>
              <p className="mt-1 text-sm text-muted">
                {e.n} kandidatov · {e.m} M ({e.odstotekM} %) · {e.z} Ž ({e.odstotekZ} %)
                {e.brezSpola > 0 ? ` · ${e.brezSpola} brez spola` : ''}
              </p>

              {e.opozorila.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {e.opozorila.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {o}
                    </li>
                  ))}
                </ul>
              )}

              <ol className="mt-4 divide-y divide-line/70">
                {e.kandidati.map((k, i) => {
                  const sc = spolChip(k.spol)
                  return (
                    <li key={String(k.id)} className="flex items-center gap-3 py-2">
                      <span className="w-6 shrink-0 text-sm font-bold text-muted">{i + 1}.</span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: sc.bg, color: sc.c }}>
                        {sc.t}
                      </span>
                      <Link href={`/admin/collections/svetniki/${k.id}`} className="flex-1 text-sm font-medium text-navy hover:text-teal">
                        {k.imePriimek || '(brez imena)'}
                      </Link>
                      {!k.povezanZUporabnikom ? (
                        <span className="text-xs text-muted">ni povezan z uporabnikom</span>
                      ) : !k.dokumentacijaOk ? (
                        <span className="text-xs font-semibold text-amber-700">dokumenti niso popolni</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600">✓ dokumenti</span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
