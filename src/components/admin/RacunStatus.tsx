'use client'

import { useState } from 'react'
import { useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

// Na zapisu uporabnika: pokaže, ali je račun aktiviran (uporabnik se je že prijavil),
// in omogoči ponovno pošiljanje povezave za nastavitev gesla (ponovna registracija).
export const RacunStatus = () => {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const zadnja = (fields as Record<string, { value?: unknown }>)['zadnjaPrijava']?.value
  const aktiviran = Boolean(zadnja)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)

  const datum = (v: unknown) => {
    try {
      return new Date(v as string).toLocaleString('sl-SI', { dateStyle: 'medium', timeStyle: 'short' })
    } catch {
      return ''
    }
  }

  if (!id) {
    return <p style={{ margin: '0.5rem 0', fontSize: 13, color: '#5b5f73' }}>Najprej shrani uporabnika.</p>
  }

  const posljiPonovno = async () => {
    setLoading(true)
    setMsg('')
    try {
      const r = await fetch('/interno/ponovna-registracija', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      })
      const d = await r.json()
      if (d.ok) {
        setOk(true)
        setMsg('✓ Povezava za nastavitev gesla je poslana uporabniku.')
      } else {
        setOk(false)
        setMsg(d.error || 'Pošiljanje ni uspelo.')
      }
    } catch {
      setOk(false)
      setMsg('Povezava ni uspela.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '0.5rem 0 1.25rem', padding: 14, border: '1px solid #e7e9f1', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            borderRadius: 999,
            padding: '3px 12px',
            fontSize: 13,
            fontWeight: 700,
            background: aktiviran ? '#e8f8ee' : '#fff4e5',
            color: aktiviran ? '#157a43' : '#b8860b',
          }}
        >
          {aktiviran ? '✓ Račun aktiviran' : '⚠ Račun še ni aktiviran'}
        </span>
        {aktiviran && <span style={{ fontSize: 12, color: '#5b5f73' }}>Zadnja prijava: {datum(zadnja)}</span>}
      </div>
      <p style={{ fontSize: 12.5, color: '#5b5f73', margin: '10px 0' }}>
        {aktiviran
          ? 'Uporabnik se je že prijavil in nastavil geslo.'
          : 'Uporabnik še ni nastavil gesla (se ni prijavil). Lahko mu ponovno pošlješ povezavo za nastavitev gesla.'}
      </p>
      <button type="button" onClick={posljiPonovno} disabled={loading} className="btn btn--style-secondary btn--size-small">
        {loading ? 'Pošiljam …' : '✉️ Pošlji povezavo za nastavitev gesla'}
      </button>
      {msg && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            background: ok ? '#e8f8ee' : '#fdecee',
            color: ok ? '#157a43' : '#b00020',
            border: `1px solid ${ok ? '#bfe8cd' : '#f3c2c8'}`,
          }}
        >
          {msg}
        </div>
      )}
    </div>
  )
}
