'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

type Korak = { kljuc: string; label: string; done: boolean }
type Naloga = { naslov: string; status: string; rok: string }
type Dogodek = { naslov: string; tip: string; zacetek: string; lokacija: string }
type Podatki = {
  ok: boolean
  jaz: { id: number; ime: string }
  kraj: string
  onboarding: { odstotek: number; opravljeno: number; stevilo: number; koraki: Korak[]; naslednje: Korak | null }
  naloge: Naloga[]
  dogodki: Dogodek[]
}

const NAVODILA_KORAK: Record<string, string> = {
  osnovno: 'V profilu izpolnite ime, telefon in osebni e-naslov.',
  foto: 'Naložite svojo fotografijo za javno predstavitev.',
  predstavitev: 'Napišite kratko predstavitev (lahko z gumbom »Generiraj z AI«).',
  podrocja: 'Vpišite področja, na katerih želite sodelovati.',
  zivljenjepis: 'Naložite življenjepis kot dokument.',
  dokumentacija: 'Oddajte vse zahtevane dokumente in soglasja.',
}

const datum = (iso: string, sCasom = false) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(
      'sl-SI',
      sCasom
        ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
        : { day: 'numeric', month: 'long', year: 'numeric' },
    )
  } catch {
    return ''
  }
}

const STATUS_NALOGE: Record<string, string> = { odprta: 'Odprta', v_teku: 'V teku', zakljucena: 'Zaključena' }

export const KandidatPlosca = () => {
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
  const profilUrl = `/admin/collections/users/${mojId}`

  const box: React.CSSProperties = { border: '1px solid #e7e9f1', borderRadius: 12, padding: '1.1rem 1.25rem', background: '#fff' }
  const naslovKartice: React.CSSProperties = { fontWeight: 700, color: '#0f004e', margin: '0 0 8px', fontSize: 14.5 }
  const gumb: React.CSSProperties = {
    display: 'inline-block',
    background: '#00bbc1',
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
    padding: '9px 16px',
    borderRadius: 999,
    textDecoration: 'none',
  }
  const povezava = (href: string, ikona: string, naslov: string, opis: string) => (
    <a
      href={href}
      style={{ ...box, textDecoration: 'none', display: 'flex', gap: 12, alignItems: 'center', transition: 'border-color .15s' }}
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

  const odstotek = d?.onboarding.odstotek ?? 0

  return (
    <div style={{ margin: '0 0 2rem' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: '#0f004e' }}>
        Pozdravljen/-a{ime ? `, ${ime}` : ''} 👋
      </h2>
      <p style={{ color: '#5b5f73', margin: '0 0 18px', fontSize: 13.5 }}>
        Vaša osebna nadzorna plošča kandidata. Spodaj vidite, kaj morate še urediti.
      </p>

      {/* Napredek profila */}
      <div style={{ ...box, marginBottom: 16, background: '#f7fdfd', borderColor: '#cfe8ea' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#0f004e', fontSize: 15 }}>Moj kandidatni profil</span>
          <span style={{ fontWeight: 800, color: '#008288', fontSize: 18 }}>{odstotek} %</span>
        </div>
        <div style={{ marginTop: 8, height: 10, borderRadius: 999, background: '#e3eef0', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${odstotek}%`, background: '#00bbc1', transition: 'width .4s' }} />
        </div>

        {/* Kaj naslednje */}
        {d?.onboarding.naslednje ? (
          <div style={{ marginTop: 14, padding: '12px 14px', background: '#fff', border: '1px solid #ffe0a6', borderRadius: 10 }}>
            <div style={{ fontWeight: 700, color: '#0f004e', fontSize: 13.5, marginBottom: 2 }}>
              Kaj moram narediti naslednje?
            </div>
            <div style={{ color: '#33384a', fontSize: 13, marginBottom: 10 }}>
              {NAVODILA_KORAK[d.onboarding.naslednje.kljuc] || d.onboarding.naslednje.label}
            </div>
            <a href={profilUrl} style={gumb}>
              Dopolni profil →
            </a>
          </div>
        ) : (
          d && (
            <p style={{ marginTop: 12, marginBottom: 0, color: '#157a43', fontWeight: 600, fontSize: 13.5 }}>
              ✓ Vaš profil je popoln. Hvala!
            </p>
          )
        )}

        {/* Seznam korakov */}
        {d && (
          <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
            {d.onboarding.koraki.map((k) => (
              <div key={k.kljuc} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: k.done ? '#157a43' : '#b9bdc9' }}>{k.done ? '✓' : '○'}</span>
                <span style={{ color: k.done ? '#5b5f73' : '#0f004e', textDecoration: k.done ? 'line-through' : 'none' }}>
                  {k.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Naloge + Dogodki */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div style={box}>
          <p style={naslovKartice}>📋 Moje naloge</p>
          {d && d.naloge.length === 0 && <p style={{ color: '#5b5f73', fontSize: 13, margin: 0 }}>Trenutno nimate odprtih nalog.</p>}
          {d?.naloge.map((n, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f2f6', fontSize: 13 }}>
              <span style={{ color: '#0f004e' }}>{n.naslov}</span>
              <span style={{ color: '#5b5f73', whiteSpace: 'nowrap' }}>
                {STATUS_NALOGE[n.status] || n.status}
                {n.rok ? ` · ${datum(n.rok)}` : ''}
              </span>
            </div>
          ))}
        </div>

        <div style={box}>
          <p style={naslovKartice}>📅 Moji prihajajoči dogodki</p>
          {d && d.dogodki.length === 0 && <p style={{ color: '#5b5f73', fontSize: 13, margin: 0 }}>Ni prihajajočih dogodkov.</p>}
          {d?.dogodki.map((dg, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f1f2f6', fontSize: 13 }}>
              <span style={{ color: '#0f004e', fontWeight: 600 }}>{dg.naslov}</span>
              <span style={{ display: 'block', color: '#5b5f73', fontSize: 12.5 }}>
                {datum(dg.zacetek, true)}
                {dg.lokacija ? ` · ${dg.lokacija}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hitre povezave */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {povezava(profilUrl, '👤', 'Moj profil in dokumenti', 'Uredi podatke, fotografijo, dokumente')}
        {povezava('/interno/koledar', '📅', 'Koledar dogodkov', 'Sestanki, slikanja, debate')}
        {povezava('/interno/klepet', '💬', 'Klepet ekipe', 'Pogovor z ekipo in vodstvom')}
        {povezava('/interno/seje', '🗳️', 'Dopisne seje', 'Glasovanje o sklepih')}
      </div>
    </div>
  )
}
