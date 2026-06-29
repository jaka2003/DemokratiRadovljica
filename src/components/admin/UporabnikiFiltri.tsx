'use client'

import { useEffect, useState } from 'react'

// Hitri filtri nad seznamom uporabnikov – en klik namesto nerodnega graditelja pogojev.
const BASE = '/admin/collections/users'
const FILTRI: { label: string; q: string }[] = [
  { label: 'Vsi', q: '' },
  { label: 'Neaktivirani', q: '?where[zadnjaPrijava][exists]=false' },
  { label: 'Aktivirani', q: '?where[zadnjaPrijava][exists]=true' },
  { label: 'Člani', q: '?where[vloga][contains]=clan' },
  { label: 'Kandidati', q: '?where[vloga][contains]=kandidat_svetnik' },
  { label: 'Mladi demokrati', q: '?where[vloga][contains]=mladi_demokrat' },
  { label: 'Ekipa kampanje', q: '?where[vloga][contains]=ekipa_kampanja' },
  { label: 'Uredniki', q: '?where[vloga][contains]=urednik' },
  { label: 'Administratorji', q: '?where[vloga][contains]=administrator' },
]

export const UporabnikiFiltri = () => {
  const [search, setSearch] = useState('')
  useEffect(() => {
    setSearch(decodeURIComponent(window.location.search))
  }, [])

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '4px 0 16px', alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#5b5f73', marginRight: 2 }}>Hitri filtri:</span>
      {FILTRI.map((f) => {
        const aktiven = f.q === '' ? !search.includes('where') : search.includes(f.q.slice(1))
        return (
          <a
            key={f.label}
            href={BASE + f.q}
            style={{
              borderRadius: 999,
              padding: '5px 13px',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              border: `1px solid ${aktiven ? '#00bbc1' : '#e2e5ef'}`,
              background: aktiven ? '#00bbc1' : '#fff',
              color: aktiven ? '#fff' : '#33384a',
            }}
          >
            {f.label}
          </a>
        )
      })}
    </div>
  )
}
