import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { VLOGE } from '@/access/roles'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Koledar kampanje' }

const VLOGA_LABEL: Record<string, string> = Object.fromEntries(VLOGE.map((v) => [v.value, v.label]))

const TIP: Record<string, { label: string; color: string }> = {
  sestanek: { label: 'Sestanek', color: '#0f004e' },
  slikanje: { label: 'Slikanje', color: '#00bbc1' },
  debata: { label: 'Debata', color: '#b8860b' },
  dogodek: { label: 'Dogodek', color: '#2a1f7a' },
  drugo: { label: 'Drugo', color: '#5b5f73' },
}

type Dogodek = {
  id: string | number
  naslov: string
  tip: string
  status: string
  zacetek: string
  konec?: string | null
  lokacija?: string | null
  opis?: string | null
  skupine?: string[] | null
  udelezenci?: ({ ime?: string; email?: string } | string | number)[] | null
}

const cas = (iso: string) =>
  new Date(iso).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })
const datumNaslov = (iso: string) =>
  new Date(iso).toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const datumKljuc = (iso: string) => new Date(iso).toLocaleDateString('sl-SI')

export default async function KoledarPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')

  const danes = new Date()
  danes.setHours(0, 0, 0, 0)
  const res = await payload.find({
    collection: 'dogodki',
    where: { zacetek: { greater_than_equal: danes.toISOString() } },
    sort: 'zacetek',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })
  const dogodki = res.docs as unknown as Dogodek[]

  // Združi po datumu.
  const skupine: { kljuc: string; naslov: string; dogodki: Dogodek[] }[] = []
  for (const d of dogodki) {
    const k = datumKljuc(d.zacetek)
    let g = skupine.find((s) => s.kljuc === k)
    if (!g) {
      g = { kljuc: k, naslov: datumNaslov(d.zacetek), dogodki: [] }
      skupine.push(g)
    }
    g.dogodki.push(d)
  }

  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cloud text-teal">
            <Calendar className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy">Koledar kampanje</h1>
            <p className="text-sm text-muted">Prihajajoči sestanki, slikanja, debate in dogodki.</p>
          </div>
        </div>

        {skupine.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-line bg-cloud p-10 text-center text-muted">
            Ni prihajajočih dogodkov. Dodaš jih v administraciji → <strong>Kampanja → Koledar / dogodki</strong>.
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {skupine.map((g) => (
              <div key={g.kljuc}>
                <h2 className="text-sm font-bold uppercase tracking-wide text-teal-700">{g.naslov}</h2>
                <div className="mt-3 space-y-3">
                  {g.dogodki.map((d) => {
                    const t = TIP[d.tip] || TIP.drugo
                    const preklican = d.status === 'preklicano'
                    const udel = (d.udelezenci || []).filter((u) => typeof u === 'object') as {
                      ime?: string
                      email?: string
                    }[]
                    const skupineLbl = (d.skupine || []).map((s) => VLOGA_LABEL[s] || s)
                    const udelImena = udel.map((u) => u.ime || u.email).filter(Boolean) as string[]
                    return (
                      <div
                        key={d.id}
                        className={`rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-card ${preklican ? 'opacity-60' : ''}`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                            style={{ backgroundColor: t.color }}
                          >
                            {t.label}
                          </span>
                          {preklican && (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                              Preklicano
                            </span>
                          )}
                          <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                            <Clock className="h-4 w-4 text-teal" strokeWidth={2} />
                            {cas(d.zacetek)}
                            {d.konec ? ` – ${cas(d.konec)}` : ''}
                          </span>
                        </div>

                        <h3 className={`mt-2 text-lg font-bold text-navy ${preklican ? 'line-through' : ''}`}>{d.naslov}</h3>

                        <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                          {d.lokacija && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-teal" strokeWidth={2} /> {d.lokacija}
                            </span>
                          )}
                        </div>

                        {(skupineLbl.length > 0 || udelImena.length > 0) && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-muted">
                            <Users className="h-4 w-4 shrink-0 text-teal" strokeWidth={2} />
                            {skupineLbl.map((s, i) => (
                              <span
                                key={`s-${i}`}
                                className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal-700"
                              >
                                {s}
                              </span>
                            ))}
                            {udelImena.length > 0 && <span className="text-navy/80">{udelImena.join(', ')}</span>}
                          </div>
                        )}

                        {d.opis && <p className="mt-2 whitespace-pre-line text-sm text-navy/80">{d.opis}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
