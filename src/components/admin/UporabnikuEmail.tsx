'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

// Gumb na zapisu uporabnika: pošlji mu poljubno e-pošto (zadeva + besedilo), kadarkoli.
// Pozdravno sporočilo gre samodejno ob ustvarjenju – to je za naknadna, poljubna sporočila.
export const UporabnikuEmail = () => {
  const { id } = useDocumentInfo()
  const [odprto, setOdprto] = useState(false)
  const [zadeva, setZadeva] = useState('')
  const [besedilo, setBesedilo] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)

  if (!id) {
    return (
      <p style={{ margin: '0.5rem 0', fontSize: 13, color: '#5b5f73' }}>
        Najprej shrani uporabnika, nato mu lahko pošlješ e-pošto.
      </p>
    )
  }

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '9px 11px',
    marginBottom: 10,
    borderRadius: 10,
    border: '1px solid #e2e5ef',
    fontSize: 13,
    color: '#0f004e',
    background: '#fff',
    outline: 'none',
  }

  const poslji = async () => {
    if (!zadeva.trim() || !besedilo.trim()) {
      setOk(false)
      setMsg('Vnesi zadevo in besedilo.')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/interno/poslji-uporabniku-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, zadeva, besedilo }),
      })
      const json = await res.json()
      if (json.ok) {
        setOk(true)
        setMsg('✓ E-pošta poslana.')
        setZadeva('')
        setBesedilo('')
      } else {
        setOk(false)
        setMsg(json.error || 'Pošiljanje ni uspelo.')
      }
    } catch {
      setOk(false)
      setMsg('Povezava ni uspela.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '0.5rem 0 1rem' }}>
      <button
        type="button"
        onClick={() => setOdprto((v) => !v)}
        className="btn btn--style-secondary btn--size-small"
      >
        {odprto ? 'Zapri' : '✉️ Pošlji e-pošto uporabniku'}
      </button>

      {odprto && (
        <div style={{ marginTop: 10, padding: 14, border: '1px solid #e7e9f1', borderRadius: 12, background: '#fbfcfe' }}>
          <p style={{ fontSize: 12.5, color: '#5b5f73', margin: '0 0 10px' }}>
            Napiši poljubno sporočilo temu uporabniku in ga pošlji na njegov e-naslov.
          </p>
          <input value={zadeva} onChange={(e) => setZadeva(e.target.value)} placeholder="Zadeva" style={inp} />
          <textarea
            value={besedilo}
            onChange={(e) => setBesedilo(e.target.value)}
            placeholder="Besedilo sporočila …"
            rows={6}
            style={{ ...inp, resize: 'vertical' }}
          />
          <button type="button" onClick={poslji} disabled={loading} className="btn btn--style-primary btn--size-small">
            {loading ? 'Pošiljam …' : 'Pošlji'}
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
      )}
    </div>
  )
}
