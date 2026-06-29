'use client'

import { useEffect, useState } from 'react'

// Splošni hitri filtri (gumbi) nad seznamom – prepozna rubriko iz URL-ja in pokaže ustrezne
// predloge. Registrira se prek admin.components.beforeListTable na vsaki zbirki z isto potjo.
type Preset = { label: string; q: string }

const PRESETI: Record<string, Preset[]> = {
  users: [
    { label: 'Vsi', q: '' },
    { label: 'Neaktivirani', q: '?where[zadnjaPrijava][exists]=false' },
    { label: 'Aktivirani', q: '?where[zadnjaPrijava][exists]=true' },
    { label: 'Člani', q: '?where[vloga][contains]=clan' },
    { label: 'Kandidati', q: '?where[vloga][contains]=kandidat_svetnik' },
    { label: 'Mladi demokrati', q: '?where[vloga][contains]=mladi_demokrat' },
    { label: 'Ekipa kampanje', q: '?where[vloga][contains]=ekipa_kampanja' },
    { label: 'Uredniki', q: '?where[vloga][contains]=urednik' },
    { label: 'Administratorji', q: '?where[vloga][contains]=administrator' },
  ],
  'pristopne-izjave': [
    { label: 'Vse', q: '' },
    { label: 'Novo', q: '?where[status][equals]=novo' },
    { label: 'V obravnavi', q: '?where[status][equals]=v_obravnavi' },
    { label: 'Sprejeto', q: '?where[status][equals]=sprejeto' },
    { label: 'Zavrnjeno', q: '?where[status][equals]=zavrnjeno' },
  ],
  pobude: [
    { label: 'Vse', q: '' },
    { label: 'Nove', q: '?where[status][equals]=nova' },
    { label: 'V pregledu', q: '?where[status][equals]=v_pregledu' },
    { label: 'Rešene', q: '?where[status][equals]=resena' },
    { label: 'Javno objavljene', q: '?where[javnoObjavljeno][equals]=true' },
  ],
  vprasanja: [
    { label: 'Vsa', q: '' },
    { label: 'Nova', q: '?where[status][equals]=novo' },
    { label: 'V obravnavi', q: '?where[status][equals]=v_obravnavi' },
    { label: 'Odgovorjena', q: '?where[status][equals]=odgovorjeno' },
    { label: 'Objavljena', q: '?where[objavljeno][equals]=true' },
  ],
  naloge: [
    { label: 'Vse', q: '' },
    { label: 'Odprte', q: '?where[status][equals]=odprta' },
    { label: 'V teku', q: '?where[status][equals]=v_teku' },
    { label: 'Zaključene', q: '?where[status][equals]=zakljucena' },
  ],
  dogodki: [
    { label: 'Vsi', q: '' },
    { label: 'Načrtovani', q: '?where[status][equals]=nacrtovano' },
    { label: 'Potrjeni', q: '?where[status][equals]=potrjeno' },
    { label: 'Preklicani', q: '?where[status][equals]=preklicano' },
  ],
  novice: [
    { label: 'Vse', q: '' },
    { label: 'Objavljene', q: '?where[objavljeno][equals]=true' },
    { label: 'Osnutki', q: '?where[objavljeno][equals]=false' },
  ],
  svetniki: [
    { label: 'Vsi', q: '' },
    { label: 'Objavljeni', q: '?where[objavljeno][equals]=true' },
    { label: 'Skriti', q: '?where[objavljeno][equals]=false' },
  ],
}

export const HitriFiltri = () => {
  const [path, setPath] = useState('')
  const [search, setSearch] = useState('')
  useEffect(() => {
    setPath(window.location.pathname)
    setSearch(decodeURIComponent(window.location.search))
  }, [])

  const slug = path.match(/\/admin\/collections\/([^/]+)/)?.[1] || ''
  const preseti = PRESETI[slug]
  if (!preseti || preseti.length === 0) return null
  const base = `/admin/collections/${slug}`

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '4px 0 16px', alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#5b5f73', marginRight: 2 }}>Hitri filtri:</span>
      {preseti.map((f) => {
        const aktiven = f.q === '' ? !search.includes('where') : search.includes(f.q.slice(1))
        return (
          <a
            key={f.label}
            href={base + f.q}
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
