'use client'

import { useState } from 'react'

export type MojaNaloga = { id: string | number; naslov: string; status: string; rok: string }

const dRok = (iso: string) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('sl-SI', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

// Seznam mojih odprtih nalog (rdeče = odprto) z gumbom »Označi opravljeno«.
// Ob označitvi naloga izgine s seznama. Uporablja se v portalu kandidata in člana.
export function MojeNaloge({ naloge: zacetne }: { naloge: MojaNaloga[] }) {
  const [naloge, setNaloge] = useState<MojaNaloga[]>(zacetne)
  const [busy, setBusy] = useState<string | number | null>(null)

  const oznaci = async (id: string | number) => {
    setBusy(id)
    try {
      const res = await fetch('/interno/naloga-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nalogaId: id, done: true }),
      })
      const j = await res.json()
      if (j.ok) setNaloge((prev) => prev.filter((n) => n.id !== id))
    } catch {
      /* neusodno */
    } finally {
      setBusy(null)
    }
  }

  if (naloge.length === 0) {
    return <p style={{ color: '#157a43', fontSize: 13, margin: 0, fontWeight: 600 }}>✓ Trenutno nimate odprtih nalog. Bravo!</p>
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {naloge.map((n) => (
        <div
          key={n.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            padding: '7px 10px',
            borderRadius: 8,
            background: '#fdf4f4',
            border: '1px solid #f6dcdd',
          }}
        >
          <span aria-hidden style={{ width: 9, height: 9, borderRadius: 999, background: '#e5484d', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#0f004e', fontWeight: 500, flex: '1 1 140px', minWidth: 0 }}>
            {n.naslov}
            {n.rok && <span style={{ color: '#5b5f73', fontWeight: 400 }}> · rok {dRok(n.rok)}</span>}
          </span>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => oznaci(n.id)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 11px',
              borderRadius: 999,
              border: '1px solid #30a46c',
              background: '#fff',
              color: '#157a43',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {busy === n.id ? '…' : '✓ Označi opravljeno'}
          </button>
        </div>
      ))}
    </div>
  )
}
