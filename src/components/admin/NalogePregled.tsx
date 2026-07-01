'use client'

import { useEffect, useState } from 'react'

type OsebaVNalogi = { nalogaId: string | number; userId: string | number; ime: string; email: string; status: string }
type NalogaGroup = { naslov: string; rok?: string; osebe: OsebaVNalogi[]; odprte: number; opravljene: number }
type Msg = { ok: boolean; t: string }
type Par = { userId: string | number; nalogaId?: string | number }

const jeOdprta = (s: string) => s !== 'zakljucena'
const rokTxt = (rok?: string) => {
  if (!rok) return ''
  try {
    return new Date(rok).toLocaleDateString('sl-SI', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

// Admin pregled PO NALOGAH (thread). Odpreš nalogo → vidiš posamezne osebe:
// zelena = zaključila, rdeča = odprto. Pošlji opomin/urgenco osebi ali vsem odprtim pri nalogi.
export const NalogePregled = () => {
  const [naloge, setNaloge] = useState<NalogaGroup[] | null>(null)
  const [allowed, setAllowed] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<Record<number, Msg | undefined>>({})

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
        if (d?.ok) setNaloge(d.naloge)
      })
      .catch(() => {})
  }
  useEffect(nalozi, [])

  if (!allowed) return null

  const poslji = async (idx: number, pari: Par[], urgentno: boolean, bk: string) => {
    if (pari.length === 0) return
    setBusy(bk)
    setMsg((m) => ({ ...m, [idx]: undefined }))
    try {
      const res = await fetch('/interno/naloga-opomin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pari, urgentno }),
      })
      const json = await res.json()
      setMsg((m) => ({
        ...m,
        [idx]: json.ok
          ? { ok: true, t: `✓ ${urgentno ? 'Urgenca' : 'Opomin'} poslan ${json.sent} ${json.sent === 1 ? 'osebi' : 'osebam'}.` }
          : { ok: false, t: json.error || 'Napaka pri pošiljanju.' },
      }))
    } catch {
      setMsg((m) => ({ ...m, [idx]: { ok: false, t: 'Povezava ni uspela.' } }))
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
    whiteSpace: 'nowrap',
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
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f004e', margin: 0 }}>🧵 Naloge – pregled po osebah</h2>
        <button
          type="button"
          onClick={() => {
            setNaloge(null)
            nalozi()
          }}
          className="btn btn--style-secondary btn--size-small"
          style={{ margin: 0 }}
        >
          ↻ Osveži
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: '#5b5f73', margin: '0 0 12px' }}>
        Klikni nalogo, da vidiš, kdo jo je opravil. <span style={{ color: '#157a43', fontWeight: 600 }}>Zelena</span> = zaključena,{' '}
        <span style={{ color: '#b00020', fontWeight: 600 }}>rdeča</span> = odprta. Pošlji opomin ali urgenco za izpolnitev.
      </p>

      {naloge === null ? (
        <p style={{ fontSize: 13, color: '#5b5f73' }}>Nalagam …</p>
      ) : naloge.length === 0 ? (
        <p style={{ fontSize: 13, color: '#5b5f73' }}>Ni dodeljenih nalog.</p>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {naloge.map((n, idx) => {
            const m = msg[idx]
            const odprtiPari: Par[] = n.osebe.filter((o) => jeOdprta(o.status)).map((o) => ({ userId: o.userId, nalogaId: o.nalogaId }))
            const r = rokTxt(n.rok)
            return (
              <details
                key={`${n.naslov}-${idx}`}
                style={{
                  border: '1px solid #e7e9f1',
                  borderLeft: `4px solid ${n.odprte > 0 ? '#e5484d' : '#30a46c'}`,
                  borderRadius: 8,
                  background: '#fff',
                  padding: '8px 12px',
                }}
              >
                <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, listStyle: 'none', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#0f004e', flex: '1 1 auto', minWidth: 0 }}>
                    {n.naslov}
                    {r && <span style={{ color: '#5b5f73', fontWeight: 400, fontSize: 12.5 }}> · rok {r}</span>}
                  </span>
                  {n.odprte > 0 && <span style={badge('#fdecee', '#b00020')}>● {n.odprte} odprtih</span>}
                  {n.opravljene > 0 && <span style={badge('#e8f8ee', '#157a43')}>✓ {n.opravljene} opravljenih</span>}
                </summary>

                <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                  {n.osebe.map((o) => {
                    const odprta = jeOdprta(o.status)
                    return (
                      <div
                        key={o.nalogaId}
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
                          style={{ width: 9, height: 9, borderRadius: 999, background: odprta ? '#e5484d' : '#30a46c', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 13, color: '#0f004e', fontWeight: 500, flex: '1 1 140px', minWidth: 0 }}>
                          {o.ime}
                          <span style={{ color: odprta ? '#b00020' : '#157a43', fontWeight: 600 }}> · {odprta ? 'odprto' : 'zaključeno'}</span>
                        </span>
                        {odprta ? (
                          <span style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              disabled={busy !== null || !o.email}
                              onClick={() => poslji(idx, [{ userId: o.userId, nalogaId: o.nalogaId }], false, `${idx}:${o.nalogaId}:o`)}
                              style={smallBtn('#00a1a7')}
                            >
                              {busy === `${idx}:${o.nalogaId}:o` ? '…' : 'Opomni'}
                            </button>
                            <button
                              type="button"
                              disabled={busy !== null || !o.email}
                              onClick={() => poslji(idx, [{ userId: o.userId, nalogaId: o.nalogaId }], true, `${idx}:${o.nalogaId}:u`)}
                              style={smallBtn('#b00020')}
                            >
                              {busy === `${idx}:${o.nalogaId}:u` ? '…' : '⏰ Urgentno'}
                            </button>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#157a43' }}>Zaključeno</span>
                        )}
                      </div>
                    )
                  })}

                  {n.odprte > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => poslji(idx, odprtiPari, false, `${idx}:all:o`)}
                        className="btn btn--style-secondary btn--size-small"
                        style={{ margin: 0 }}
                      >
                        {busy === `${idx}:all:o` ? 'Pošiljam …' : `✉️ Opomni vse odprte (${n.odprte})`}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => poslji(idx, odprtiPari, true, `${idx}:all:u`)}
                        className="btn btn--style-primary btn--size-small"
                        style={{ margin: 0, background: '#b00020', borderColor: '#b00020' }}
                      >
                        {busy === `${idx}:all:u` ? 'Pošiljam …' : '⏰ Urgenca za vse odprte'}
                      </button>
                    </div>
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
