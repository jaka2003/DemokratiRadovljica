'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

// Pripomoček v urejevalniku seje: predogled, testno pošiljanje in pošiljanje vabila udeležencem.
export const SejaPosiljanje = () => {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [predogled, setPredogled] = useState<{ html: string; subject: string } | null>(null)

  const klic = async (nacin: 'predogled' | 'test' | 'poslji') => {
    if (!id) {
      setOk(false)
      setMsg('Najprej shrani sejo (gumb »Save«/»Shrani«), nato pošlji.')
      return
    }
    if (nacin === 'poslji' && !window.confirm('Pošljem vabilo vsem udeležencem? Seja bo označena kot »V teku«.')) return
    setLoading(nacin)
    setMsg('')
    setPredogled(null)
    try {
      const res = await fetch('/interno/seje/poslji', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nacin }),
      })
      const json = await res.json()
      if (!json.ok) {
        setOk(false)
        setMsg(json.error || 'Napaka.')
        return
      }
      if (nacin === 'predogled') setPredogled({ html: json.html, subject: json.subject })
      else if (nacin === 'test') {
        setOk(true)
        setMsg('Testno sporočilo je poslano na vaš e-naslov.')
      } else {
        setOk(true)
        setMsg(`✓ Vabilo poslano ${json.sent} udeležencem. Seja je zdaj »V teku«.`)
      }
    } catch {
      setOk(false)
      setMsg('Povezava ni uspela.')
    } finally {
      setLoading('')
    }
  }

  const btn = 'btn btn--size-small'

  return (
    <div style={{ margin: '0.5rem 0 1rem', padding: '1rem', border: '1px solid #e7e9f1', borderRadius: 10 }}>
      <p style={{ fontSize: 13, color: '#5b5f73', margin: '0 0 12px' }}>
        Pošlji vabilo z gradivom in povezavo za glasovanje vsem izbranim udeležencem. Seja mora biti shranjena.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button type="button" disabled={!!loading} onClick={() => klic('predogled')} className={`${btn} btn--style-secondary`}>
          {loading === 'predogled' ? 'Pripravljam …' : '👁️ Predogled'}
        </button>
        <button type="button" disabled={!!loading} onClick={() => klic('test')} className={`${btn} btn--style-secondary`}>
          {loading === 'test' ? 'Pošiljam …' : '✉️ Testno (meni)'}
        </button>
        <button type="button" disabled={!!loading} onClick={() => klic('poslji')} className={`${btn} btn--style-primary`}>
          {loading === 'poslji' ? 'Pošiljam …' : '📨 Pošlji vabilo udeležencem'}
        </button>
      </div>
      {msg && (
        <div
          style={{
            marginTop: 12,
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
      {predogled && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: '#5b5f73', marginBottom: 4 }}>
            Zadeva: <strong style={{ color: '#0f004e' }}>{predogled.subject}</strong>
          </div>
          <div
            style={{ border: '1px solid #e7e9f1', borderRadius: 8, padding: 16, background: '#fff', maxHeight: 360, overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: predogled.html }}
          />
        </div>
      )}
    </div>
  )
}
