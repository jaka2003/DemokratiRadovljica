'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

type Dogodek = { naslov: string; tip: string; zacetek: string; lokacija: string }
type Novica = { naslov: string; slug: string }
type Naloga = { naslov: string; status: string; rok: string }
type Podatki = {
  ok: boolean
  jaz: { id: number; ime: string }
  kraj: string
  dogodki: Dogodek[]
  novice: Novica[]
  naloge: Naloga[]
}

const STATUS_NALOGE: Record<string, string> = { odprta: 'Odprta', v_teku: 'V teku', zakljucena: 'Zaključena' }

const datum = (iso: string) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('sl-SI', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const datumDan = (iso: string) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export const ClanPlosca = () => {
  const { user } = useAuth()
  const [d, setD] = useState<Podatki | null>(null)
  const mojId = (user as { id?: string | number } | null)?.id

  useEffect(() => {
    fetch('/interno/moja-plosca', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => j?.ok && setD(j))
      .catch(() => {})
  }, [])

  const ime = d?.jaz.ime || (user as { ime?: string } | null)?.ime || ''
  const kraj = d?.kraj || ''

  const box: React.CSSProperties = { border: '1px solid #e7e9f1', borderRadius: 12, padding: '1.1rem 1.25rem', background: '#fff' }
  const naslovKartice: React.CSSProperties = { fontWeight: 700, color: '#0f004e', margin: '0 0 8px', fontSize: 14.5 }

  const povezava = (href: string, ikona: string, naslov: string, opis: string, zunanji = false) => (
    <a
      href={href}
      {...(zunanji ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{ ...box, textDecoration: 'none', display: 'flex', gap: 12, alignItems: 'center' }}
    >
      <span style={{ fontSize: 24 }} aria-hidden>
        {ikona}
      </span>
      <span>
        <span style={{ display: 'block', fontWeight: 700, color: '#0f004e', fontSize: 14 }}>{naslov}</span>
        <span style={{ display: 'block', color: '#5b5f73', fontSize: 12.5 }}>{opis}</span>
      </span>
    </a>
  )

  return (
    <div style={{ margin: '0 0 2rem' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: '#0f004e' }}>
        Pozdravljeni{ime ? `, ${ime}` : ''} 👋
      </h2>
      <p style={{ color: '#5b5f73', margin: '0 0 18px', fontSize: 13.5 }}>
        Dobrodošli v ekipi Demokrati Radovljica. Skupaj pripravljamo program Uspešna Radovljica 2026–2034.
        {kraj ? ` Vaš kraj: ${kraj}.` : ''}
      </p>

      {/* Moje naloge */}
      {d && d.naloge && d.naloge.length > 0 && (
        <div style={{ ...box, marginBottom: 16, borderColor: '#ffe0a6', background: '#fffdf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <p style={{ ...naslovKartice, margin: 0 }}>📋 Moje naloge</p>
            <a href="/admin/collections/naloge" style={{ fontSize: 12.5, color: '#00807f', fontWeight: 600, textDecoration: 'none' }}>
              Odpri in spremeni status →
            </a>
          </div>
          {d.naloge.map((n, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f2f6', fontSize: 13 }}>
              <span style={{ color: '#0f004e' }}>{n.naslov}</span>
              <span style={{ color: '#5b5f73', whiteSpace: 'nowrap' }}>
                {STATUS_NALOGE[n.status] || n.status}
                {n.rok ? ` · ${datumDan(n.rok)}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Aktualno + Dogodki */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div style={box}>
          <p style={naslovKartice}>📣 Aktualno</p>
          {d && d.novice.length === 0 && <p style={{ color: '#5b5f73', fontSize: 13, margin: 0 }}>Trenutno ni novih obvestil.</p>}
          {d?.novice.map((n, i) => (
            <a
              key={i}
              href={n.slug ? `/novice/${n.slug}` : '/novice'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: '6px 0', borderBottom: '1px solid #f1f2f6', fontSize: 13, color: '#0f004e', textDecoration: 'none' }}
            >
              {n.naslov}
            </a>
          ))}
        </div>

        <div style={box}>
          <p style={naslovKartice}>📅 Prihajajoči dogodki</p>
          {d && d.dogodki.length === 0 && <p style={{ color: '#5b5f73', fontSize: 13, margin: 0 }}>Ni prihajajočih dogodkov.</p>}
          {d?.dogodki.map((dg, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f1f2f6', fontSize: 13 }}>
              <span style={{ color: '#0f004e', fontWeight: 600 }}>{dg.naslov}</span>
              <span style={{ display: 'block', color: '#5b5f73', fontSize: 12.5 }}>
                {datum(dg.zacetek)}
                {dg.lokacija ? ` · ${dg.lokacija}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kako lahko pomagam */}
      <p style={{ fontSize: 11, fontWeight: 700, color: '#0f004e', textTransform: 'uppercase', letterSpacing: 0.4, margin: '4px 0 8px' }}>
        Kako lahko pomagam
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {povezava('/pobude', '📍', 'Predlagaj pobudo', 'Opozori na težavo ali predlagaj rešitev', true)}
        {povezava('/interno/koledar', '📅', 'Koledar dogodkov', 'Poglej, kje se dogaja')}
        {povezava('/interno/klepet', '💬', 'Klepet ekipe', 'Pogovor z ekipo')}
        {povezava(`/admin/collections/users/${mojId}`, '👤', 'Moj profil', 'Uredi kontakt in podatke')}
      </div>
    </div>
  )
}
