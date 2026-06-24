'use client'

import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type Tocka = {
  id: string
  naslov: string
  za: number
  proti: number
  vzdrzan: number
  skupaj: number
  udelezba: number
  sprejet: boolean
  kdoJe: string[]
  kdoNi: string[]
}
type Pregled = { ok: boolean; status: string; steviloUdelezencev: number; tocke: Tocka[]; error?: string }

const STATUS_LABEL: Record<string, string> = {
  osnutek: 'Osnutek',
  pripravljena: 'Pripravljena za pošiljanje',
  v_teku: 'V teku',
  zakljucena: 'Zaključena',
}

export const SejaRezultati = () => {
  const { id } = useDocumentInfo()
  const [data, setData] = useState<Pregled | null>(null)
  const [loading, setLoading] = useState(false)

  const nalozi = () => {
    if (!id) return
    setLoading(true)
    fetch(`/interno/seje/pregled?id=${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    nalozi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!id) {
    return <p style={{ fontSize: 13, color: '#5b5f73' }}>Najprej shrani sejo, da vidiš rezultate.</p>
  }
  if (loading && !data) return <p style={{ fontSize: 13, color: '#5b5f73' }}>Nalagam rezultate …</p>
  if (!data?.ok) return <p style={{ fontSize: 13, color: '#b00020' }}>{data?.error || 'Rezultatov ni mogoče naložiti.'}</p>

  const pill = (label: string, value: number | string, c: string, bg: string) => (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 600, background: bg, color: c }}>
      {label}: {value}
    </span>
  )

  return (
    <div style={{ margin: '0.5rem 0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ borderRadius: 999, padding: '3px 12px', fontSize: 13, fontWeight: 700, background: '#e6fbfb', color: '#008288' }}>
          Status: {STATUS_LABEL[data.status] || data.status}
        </span>
        <span style={{ fontSize: 13, color: '#5b5f73' }}>Udeležencev: {data.steviloUdelezencev}</span>
        <button type="button" onClick={nalozi} className="btn btn--style-secondary btn--size-small" style={{ marginLeft: 'auto' }}>
          ↻ Osveži
        </button>
        <a href={`/interno/seje/${id}/porocilo`} target="_blank" rel="noopener noreferrer" className="btn btn--style-primary btn--size-small">
          📄 Poročilo / tisk
        </a>
      </div>

      {data.tocke.length === 0 && <p style={{ fontSize: 13, color: '#5b5f73' }}>Seja še nima točk dnevnega reda.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.tocke.map((t, i) => (
          <div key={t.id} style={{ border: '1px solid #e7e9f1', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <strong style={{ color: '#0f004e', fontSize: 14 }}>
                {i + 1}. {t.naslov}
              </strong>
              <span
                style={{
                  borderRadius: 999,
                  padding: '2px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  background: t.sprejet ? '#e8f8ee' : '#fdecee',
                  color: t.sprejet ? '#157a43' : '#b00020',
                }}
              >
                {t.sprejet ? '✓ Sklep sprejet' : '✕ Sklep ni sprejet'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {pill('ZA', t.za, '#157a43', '#e8f8ee')}
              {pill('PROTI', t.proti, '#b00020', '#fdecee')}
              {pill('VZDRŽAN', t.vzdrzan, '#5b5f73', '#f1f2f6')}
              {pill('Skupaj', t.skupaj, '#0f004e', '#eef1f6')}
              {pill('Udeležba', `${t.udelezba} %`, '#008288', '#e6fbfb')}
            </div>
            {/* napredek */}
            <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: '#eef1f6', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${t.udelezba}%`, background: '#00bbc1' }} />
            </div>
            {t.kdoNi.length > 0 ? (
              <p style={{ fontSize: 12, color: '#5b5f73', marginTop: 8, marginBottom: 0 }}>
                Čaka na glasovanje: {t.kdoNi.join(', ')}
              </p>
            ) : (
              <p style={{ fontSize: 12, color: '#157a43', marginTop: 8, marginBottom: 0 }}>Vsi so glasovali.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
