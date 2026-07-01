'use client'

import { useEffect, useState } from 'react'

type NalogaRow = { id: string | number; naslov: string; status: string; rok?: string }
type Oseba = {
  id: string | number
  ime: string
  email: string
  naloge: NalogaRow[]
  odprte: number
  zakljucene: number
}
type Msg = { ok: boolean; t: string }

const jeOdprta = (s: string) => s !== 'zakljucena'
const rokTxt = (rok?: string) => {
  if (!rok) return ''
  try {
    return new Date(rok).toLocaleDateString('sl-SI', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

// Admin pregled nalog po osebah (thread). Odprte = rdeče, zaključene = zelene.
// Pošlji opomin ali urgenco za posamezno nalogo ali za vse odprte osebe.
export const NalogePoOsebah = () => {
  const [osebe, setOsebe] = useState<Oseba[] | null>(null)
  const [allowed, setAllowed] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<Record<string, Msg>>({})

  const nalozi = () => {
    fetch('/interno/naloge-pregled', { credentials: 'include' })
      .then((r) => {
        if (r.status === 403) {
          setAllowed(false)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (d?.ok) setOsebe(d.osebe)
      })
      .catch(() => {})
  }
  useEffect(nalozi, [])

  if (!allowed) return null

  const poslji = async (
    oseba: Oseba,
    opts: { nalogaId?: string | number; urgentno?: boolean },
  ) => {
    const bk = `${oseba.id}:${opts.nalogaId ?? 'all'}:${opts.urgentno ? 'u' : 'o'}`
    setBusy(bk)
    setMsg((m) => ({ ...m, [String(oseba.id)]: undefined as unknown as Msg }))
    try {
      const res = await fetch('/interno/naloga-opomin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: oseba.id, nalogaId: opts.nalogaId, urgentno: !!opts.urgentno }),
      })
      const json = await res.json()
      setMsg((m) => ({
        ...m,
        [String(oseba.id)]: json.ok
          ? { ok: true, t: `✓ ${opts.urgentno ? 'Urgenca' : 'Opomin'} poslan${json.count > 1 ? ` (${json.count} nalog)` : ''} na ${oseba.email}.` }
          : { ok: false, t: json.error || 'Napaka pri pošiljanju.' },
      }))
    } catch {
      setMsg((m) => ({ ...m, [String(oseba.id)]: { ok: false, t: 'Povezava ni uspela.' } }))
    } finally {
      setBusy(null)
    }
  }

  const box: React.CSSProperties = { border: '1px solid #e7e9f1', borderRadius: 10, padding: '1rem' }
  const badge = (bg: string, col: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    padding: '2px 9px',
    borderRadius: 999,
    background: bg,
    color: col,
  })
  const smallBtn = (accent: string): React.CSSProperties => ({
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 999,
    border: `1px solid ${accent}`,
    background: '#fff',
    color: accent,
    cursor: 'pointer',
  })

  return (
    <div style={{ ...box, margin: '0 0 1.25rem', background: '#fbfcfe' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f004e', margin: 0 }}>🧵 Naloge po osebah</h2>
        <button
          type="button"
          onClick={() => {
            setOsebe(null)
            nalozi()
          }}
          className="btn btn--style-secondary btn--size-small"
          style={{ margin: 0 }}
        >
          ↻ Osveži
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: '#5b5f73', margin: '0 0 12px' }}>
        Klikni osebo, da odpreš njene naloge. <span style={{ color: '#b00020', fontWeight: 600 }}>Rdeče</span> = neopravljene,{' '}
        <span style={{ color: '#157a43', fontWeight: 600 }}>zelene</span> = zaključene. Pošlji opomin ali urgenco za izpolnitev.
      </p>

      {osebe === null ? (
        <p style={{ fontSize: 13, color: '#5b5f73' }}>Nalagam …</p>
      ) : osebe.length === 0 ? (
        <p style={{ fontSize: 13, color: '#5b5f73' }}>Ni dodeljenih nalog.</p>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {osebe.map((o) => {
            const m = msg[String(o.id)]
            return (
              <details
                key={o.id}
                style={{
                  border: '1px solid #e7e9f1',
                  borderLeft: `4px solid ${o.odprte > 0 ? '#e5484d' : '#30a46c'}`,
                  borderRadius: 8,
                  background: '#fff',
                  padding: '8px 12px',
                }}
              >
                <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, listStyle: 'none' }}>
                  <span style={{ fontWeight: 700, color: '#0f004e', flex: '1 1 auto', minWidth: 0 }}>{o.ime}</span>
                  {o.odprte > 0 && <span style={badge('#fdecee', '#b00020')}>● {o.odprte} odprtih</span>}
                  {o.zakljucene > 0 && <span style={badge('#e8f8ee', '#157a43')}>✓ {o.zakljucene}</span>}
                </summary>

                <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                  {o.naloge.map((n) => {
                    const odprta = jeOdprta(n.status)
                    const r = rokTxt(n.rok)
                    return (
                      <div
                        key={n.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                          padding: '7px 10px',
                          borderRadius: 8,
                          background: odprta ? '#fdf4f4' : '#f2faf5',
                          border: `1px solid ${odprta ? '#f6dcdd' : '#d6efe0'}`,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 999,
                            background: odprta ? '#e5484d' : '#30a46c',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 13, color: '#0f004e', fontWeight: 500, flex: '1 1 160px', minWidth: 0 }}>
                          {n.naslov}
                          {r && <span style={{ color: '#5b5f73', fontWeight: 400 }}> · rok {r}</span>}
                        </span>
                        {odprta ? (
                          <span style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              disabled={busy !== null}
                              onClick={() => poslji(o, { nalogaId: n.id })}
                              style={smallBtn('#00a1a7')}
                            >
                              {busy === `${o.id}:${n.id}:o` ? '…' : 'Opomni'}
                            </button>
                            <button
                              type="button"
                              disabled={busy !== null}
                              onClick={() => poslji(o, { nalogaId: n.id, urgentno: true })}
                              style={smallBtn('#b00020')}
                            >
                              {busy === `${o.id}:${n.id}:u` ? '…' : '⏰ Urgentno'}
                            </button>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#157a43' }}>Zaključena</span>
                        )}
                      </div>
                    )
                  })}

                  {o.odprte > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <button
                        type="button"
                        disabled={busy !== null || !o.email}
                        onClick={() => poslji(o, {})}
                        className="btn btn--style-secondary btn--size-small"
                        style={{ margin: 0 }}
                      >
                        {busy === `${o.id}:all:o` ? 'Pošiljam …' : `✉️ Opomni na vse odprte (${o.odprte})`}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null || !o.email}
                        onClick={() => poslji(o, { urgentno: true })}
                        className="btn btn--style-primary btn--size-small"
                        style={{ margin: 0, background: '#b00020', borderColor: '#b00020' }}
                      >
                        {busy === `${o.id}:all:u` ? 'Pošiljam …' : '⏰ Urgenca za vse odprte'}
                      </button>
                    </div>
                  )}

                  {!o.email && (
                    <p style={{ fontSize: 12, color: '#b00020', margin: '2px 0 0' }}>Oseba nima e-naslova – opomina ni mogoče poslati.</p>
                  )}
                  {m && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: '7px 11px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        background: m.ok ? '#e8f8ee' : '#fdecee',
                        color: m.ok ? '#157a43' : '#b00020',
                        border: `1px solid ${m.ok ? '#bfe8cd' : '#f3c2c8'}`,
                      }}
                    >
                      {m.t}
                    </div>
                  )}
                </div>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}
