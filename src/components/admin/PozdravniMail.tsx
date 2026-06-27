'use client'

import { useState } from 'react'
import { useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

// Gumb na zapisu uporabnika: »Pošlji pozdravno sporočilo«. Viden je, dokler sporočilo ni
// poslano; ko je poslano (polje »pozdravPoslanOb«), gumba ni več – le potrditev.
export const PozdravniMail = () => {
  const { id } = useDocumentInfo()
  const [fields, dispatchFields] = useAllFormFields()
  const poslanoForm = (fields as Record<string, { value?: unknown }>)['pozdravPoslanOb']?.value
  const [poslanoLokalno, setPoslanoLokalno] = useState('')
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState('')

  const poslano = poslanoLokalno || (poslanoForm ? String(poslanoForm) : '')

  const datum = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('sl-SI', { dateStyle: 'medium', timeStyle: 'short' })
    } catch {
      return ''
    }
  }

  if (!id) {
    return (
      <p style={{ margin: '0.5rem 0', fontSize: 13, color: '#5b5f73' }}>
        Najprej shrani uporabnika, nato lahko pošlješ pozdravno sporočilo.
      </p>
    )
  }

  if (poslano) {
    return (
      <p style={{ margin: '0.5rem 0', fontSize: 13, fontWeight: 600, color: '#157a43' }}>
        ✓ Pozdravno sporočilo poslano{datum(poslano) ? ` · ${datum(poslano)}` : ''}.
      </p>
    )
  }

  const poslji = async () => {
    setLoading(true)
    setNapaka('')
    try {
      const res = await fetch('/interno/poslji-pozdrav', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      })
      const json = await res.json()
      if (json.ok) {
        const ts = json.poslanoOb || new Date().toISOString()
        setPoslanoLokalno(ts)
        dispatchFields({ type: 'UPDATE', path: 'pozdravPoslanOb', value: ts })
      } else {
        setNapaka(json.error || 'Pošiljanje ni uspelo.')
      }
    } catch {
      setNapaka('Povezava ni uspela.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '0.5rem 0 1rem' }}>
      <button type="button" onClick={poslji} disabled={loading} className="btn btn--style-primary btn--size-small">
        {loading ? 'Pošiljam …' : '✉️ Pošlji pozdravno sporočilo'}
      </button>
      <p style={{ fontSize: 12, color: '#5b5f73', marginTop: 6 }}>
        Uporabniku pošlje povezavo za nastavitev gesla in dopolnitev profila. Gumb izgine, ko je sporočilo poslano.
      </p>
      {napaka && <p style={{ color: '#b00020', fontSize: 13, marginTop: 6 }}>{napaka}</p>}
    </div>
  )
}
