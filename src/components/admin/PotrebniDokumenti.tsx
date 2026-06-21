'use client'

import { useEffect, useState } from 'react'

// Prikaže kandidatu seznam potrebnih dokumentov (iz globalnih nastavitev).
export const PotrebniDokumenti = () => {
  const [docs, setDocs] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/globals/nastavitve?depth=0', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const list = (d?.potrebniDokumenti || []) as { naziv?: string }[]
        setDocs(list.map((x) => x.naziv || '').filter(Boolean))
      })
      .catch(() => {})
  }, [])

  if (docs.length === 0) return null

  return (
    <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #e7e9f1', borderRadius: 8, background: '#f4f6fa' }}>
      <strong style={{ display: 'block', marginBottom: 6 }}>Potrebni dokumenti</strong>
      <p style={{ fontSize: 12, color: '#5b5f73', marginBottom: 8 }}>
        Naloži jih v razdelku »Dokumenti« (levi meni). Potrebni so:
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
        {docs.map((d, i) => (
          <li key={i} style={{ padding: '2px 0' }}>
            {d}
          </li>
        ))}
      </ul>
    </div>
  )
}
