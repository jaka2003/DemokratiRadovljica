'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

// Gumb na prijavi za sodelovanje: ustvari uporabnika sistema iz prijave in jo označi kot
// zaključeno. Po prenosu ponudi povezavo za takojšnje urejanje novega uporabnika (vloga ipd.).
export const PrenesiVUporabnike = () => {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [userId, setUserId] = useState<string | number | null>(null)

  if (!id) {
    return (
      <p style={{ margin: '0.5rem 0', fontSize: 13, color: '#5b5f73' }}>
        Najprej shrani prijavo, nato jo lahko preneseš v uporabnike sistema.
      </p>
    )
  }

  const prenesi = async () => {
    if (!window.confirm('Iz te prijave ustvarim uporabnika sistema in prijavo označim kot zaključeno?')) return
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/interno/prenesi-prostovoljca', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prijavaId: id }),
      })
      const json = await res.json()
      if (json.ok) {
        setOk(true)
        setUserId(json.userId)
        setMsg(
          json.ze
            ? 'Uporabnik s tem e-naslovom že obstaja. Odpri ga in mu nastavi vlogo.'
            : 'Uporabnik je ustvarjen, pozdravno sporočilo poslano, prijava zaključena. Odpri ga in mu nastavi vlogo.',
        )
      } else {
        setOk(false)
        setMsg(json.error || 'Prenos ni uspel.')
      }
    } catch {
      setOk(false)
      setMsg('Povezava ni uspela.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '0.5rem 0 1rem', padding: 14, border: '1px solid #cfe8ea', borderRadius: 12, background: '#f7fdfd' }}>
      <p style={{ fontSize: 12.5, color: '#5b5f73', margin: '0 0 10px' }}>
        Iz te prijave ustvari <strong>uporabnika sistema</strong>: pošlje se pozdravno sporočilo z navodili za vpis,
        prijava pa se označi kot <strong>zaključena</strong>. Nato pri uporabniku nastaviš vlogo (član / nečlan /
        kandidat) – ob spremembi vloge ga sistem obvesti, kaj mu portal omogoča.
      </p>
      {!userId && (
        <button type="button" onClick={prenesi} disabled={loading} className="btn btn--style-primary btn--size-small">
          {loading ? 'Prenašam …' : '⇨ Prenesi v uporabnike sistema'}
        </button>
      )}
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
      {userId && (
        <a
          href={`/admin/collections/users/${userId}`}
          className="btn btn--style-secondary btn--size-small"
          style={{ marginTop: 10, textDecoration: 'none', display: 'inline-block' }}
        >
          Odpri in uredi uporabnika →
        </a>
      )}
    </div>
  )
}
