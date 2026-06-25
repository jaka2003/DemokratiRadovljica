import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowLeft, Check, X } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { isAdmin, KANDIDAT_VLOGE } from '@/access/roles'
import { kandidatNapredek } from '@/lib/onboarding'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pregled kandidatov' }

const STATUS_PROFILA: Record<string, { label: string; bg: string; c: string }> = {
  osnutek: { label: 'Osnutek', bg: '#f1f2f6', c: '#5b5f73' },
  oddan: { label: 'Oddan', bg: '#eef2ff', c: '#3730a3' },
  v_pregledu: { label: 'V pregledu', bg: '#fff7ed', c: '#9a3412' },
  potrjen: { label: 'Potrjen', bg: '#e8f8ee', c: '#157a43' },
  zavrnjen: { label: 'Zavrnjen', bg: '#fdecee', c: '#b00020' },
}

export default async function KandidatiPregledPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')
  if (!isAdmin(user)) redirect('/admin')

  const res = await payload.find({
    collection: 'users',
    where: { vloga: { in: [...KANDIDAT_VLOGE] } },
    sort: 'ime',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const vrstice = (res.docs as Record<string, unknown>[]).map((u) => {
    const napredek = kandidatNapredek(u)
    const done = (kljuc: string) => napredek.koraki.find((k) => k.kljuc === kljuc)?.done ?? false
    return {
      id: u.id as string | number,
      ime: (u.ime as string) || (u.email as string) || 'Kandidat',
      kraj: (u.naslovKraj as string) || '',
      statusProfila: String(u.statusProfila || 'osnutek'),
      odstotek: napredek.odstotek,
      foto: done('foto'),
      predstavitev: done('predstavitev'),
      dokumenti: done('dokumentacija'),
      pripravljen: napredek.odstotek === 100,
    }
  })

  const pripravljenih = vrstice.filter((v) => v.pripravljen).length
  const potrebenUkrep = vrstice.length - pripravljenih

  const Ozn = ({ ok }: { ok: boolean }) =>
    ok ? <Check className="mx-auto h-4 w-4 text-emerald-600" strokeWidth={2.5} /> : <X className="mx-auto h-4 w-4 text-red-500" strokeWidth={2.5} />

  return (
    <section className="py-10 lg:py-14">
      <Container className="max-w-5xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Nazaj v administracijo
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy">Pregled kandidatov</h1>
        <p className="mt-1.5 text-sm text-muted">Napredek dopolnjevanja profilov in dokumentacije.</p>

        {/* Povzetek */}
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-xl bg-cloud px-4 py-2 text-sm font-semibold text-navy">Skupaj: {vrstice.length}</span>
          <span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Pripravljenih: {pripravljenih}</span>
          <span className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">Potreben ukrep: {potrebenUkrep}</span>
        </div>

        {vrstice.length === 0 ? (
          <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-10 text-center text-muted">
            Trenutno ni kandidatov. Dodaj jih prek »Povabi uporabnika« in jim določi kandidatsko vlogo.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white shadow-card">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-cloud/50 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Kandidat</th>
                  <th className="px-4 py-3 font-semibold">Napredek</th>
                  <th className="px-3 py-3 text-center font-semibold">Foto</th>
                  <th className="px-3 py-3 text-center font-semibold">Predstavitev</th>
                  <th className="px-3 py-3 text-center font-semibold">Dokumenti</th>
                  <th className="px-4 py-3 font-semibold">Status profila</th>
                  <th className="px-4 py-3 font-semibold">Stanje</th>
                </tr>
              </thead>
              <tbody>
                {vrstice.map((v) => {
                  const sp = STATUS_PROFILA[v.statusProfila] || STATUS_PROFILA.osnutek
                  return (
                    <tr key={String(v.id)} className="border-b border-line/70 last:border-0 hover:bg-cloud/30">
                      <td className="px-4 py-3">
                        <Link href={`/admin/collections/users/${v.id}`} className="font-semibold text-navy hover:text-teal">
                          {v.ime}
                        </Link>
                        {v.kraj && <span className="block text-xs text-muted">{v.kraj}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-cloud">
                            <div className="h-full rounded-full bg-teal" style={{ width: `${v.odstotek}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-navy">{v.odstotek}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center"><Ozn ok={v.foto} /></td>
                      <td className="px-3 py-3 text-center"><Ozn ok={v.predstavitev} /></td>
                      <td className="px-3 py-3 text-center"><Ozn ok={v.dokumenti} /></td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: sp.bg, color: sp.c }}>
                          {sp.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={
                            v.pripravljen
                              ? { background: '#e8f8ee', color: '#157a43' }
                              : { background: '#fff4e5', color: '#b8860b' }
                          }
                        >
                          {v.pripravljen ? '✓ Pripravljen' : 'Potreben ukrep'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </section>
  )
}
