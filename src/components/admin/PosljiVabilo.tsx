'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

// Gumb v urejevalniku dogodka: pošlje e-poštno vabilo vsem udeležencem (skupine + posamezniki).
export const PosljiVabilo = () => {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [napaka, setNapaka] = useState(false)

  const send = async () => {
    if (!id) {
      setNapaka(true)
      setMsg('Najprej shrani dogodek (gumb Save), nato pošlji vabilo.')
      return
    }
    setLoading(true)
    setMsg('')
    setNapaka(false)
    try {
      const res = await fetch('/interno/dogodek-vabilo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.ok) {
        setMsg(`✓ Vabilo poslano ${json.sent} ${json.sent === 1 ? 'prejemniku' : 'prejemnikom'}.`)
      } else {
        setNapaka(true)
        setMsg(json.error || 'Napaka pri pošiljanju.')
      }
    } catch {
      setNapaka(true)
      setMsg('Povezava ni uspela.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '0.5rem 0 1rem', padding: '0.85rem 1rem', border: '1px solid #e7e9f1', borderRadius: 10 }}>
      <button type="button" onClick={send} disabled={loading} className="btn btn--style-primary btn--size-small">
        {loading ? 'Pošiljam …' : '✉️ Pošlji vabilo udeležencem'}
      </button>
      {msg && (
        <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 600, color: napaka ? '#b00020' : '#157a43' }}>{msg}</span>
      )}
      <p style={{ fontSize: 12, color: '#5b5f73', marginTop: 8, marginBottom: 0 }}>
        Pošlje e-pošto vsem osebam iz izbranih skupin in posameznim udeležencem. Dogodek mora biti shranjen.
      </p>
    </div>
  )
}
