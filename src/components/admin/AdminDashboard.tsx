'use client'

import { useEffect, useState } from 'react'
import { KRAJI } from '@/lib/pobude'

const PREDLOGE: { label: string; subject: string; body: string }[] = [
  { label: '— Brez predloge —', subject: '', body: '' },
  {
    label: 'Dopolni profil',
    subject: 'Prosimo, dopolni svoj profil',
    body: 'Pozdravljen/-a,\n\nprosimo, da v svojem profilu dopolniš manjkajoče podatke in naložiš zahtevane dokumente.\n\nHvala,\nEkipa Demokrati Radovljica',
  },
  {
    label: 'Vabilo na sestanek',
    subject: 'Vabilo na sestanek kampanje',
    body: 'Pozdravljen/-a,\n\nvabimo te na sestanek kampanje. Podrobnosti sledijo.\n\nLep pozdrav,\nEkipa Demokrati Radovljica',
  },
]

type Stats = {
  kandidati: number
  profilDokoncan: number
  brezDokumentov: number
  novePobude: number
  odprtePobude: number
  prostovoljci: number
  sporocila: number
}

const CARDS: { key: keyof Stats; label: string }[] = [
  { key: 'kandidati', label: 'Kandidati' },
  { key: 'profilDokoncan', label: 'Potrjeni profili' },
  { key: 'brezDokumentov', label: 'Brez dokumentov' },
  { key: 'novePobude', label: 'Nove pobude' },
  { key: 'odprtePobude', label: 'Odprte pobude' },
  { key: 'prostovoljci', label: 'Prijave za sodelovanje' },
  { key: 'sporocila', label: 'Kontaktna sporočila' },
]

type Seznami = {
  zadnjiKandidati: { ime: string; kraj: string }[]
  zadnjePobude: { naslov: string; kraj: string; status: string }[]
  zadnjaSporocila: { ime: string; vir: string }[]
  cakajoceNaloge: { naslov: string; status: string }[]
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [seznami, setSeznami] = useState<Seznami | null>(null)
  const [allowed, setAllowed] = useState(true)

  // Množična e-pošta
  const [filter, setFilter] = useState('vsi')
  const [subject, setSubject] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [emailMsg, setEmailMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/interno/dashboard-stats', { credentials: 'include' })
      .then((r) => {
        if (r.status === 403) {
          setAllowed(false)
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (d?.ok) {
          setStats(d.stats)
          setSeznami(d.seznami)
        }
      })
      .catch(() => {})
  }, [])

  if (!allowed) return null

  const sendEmail = async (test: boolean) => {
    setSending(true)
    setEmailMsg('')
    try {
      const fd = new FormData()
      fd.set('filter', filter)
      fd.set('subject', subject)
      fd.set('body', bodyText)
      fd.set('test', String(test))
      if (files) for (const f of Array.from(files)) fd.append('priloge', f)
      const res = await fetch('/interno/poslji-email', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok || !json.ok) setEmailMsg(json.error || 'Napaka.')
      else setEmailMsg(test ? 'Testno sporočilo poslano tebi.' : `Poslano ${json.sent} od ${json.total} prejemnikom.`)
    } catch {
      setEmailMsg('Povezava ni uspela.')
    } finally {
      setSending(false)
    }
  }

  const box: React.CSSProperties = { border: '1px solid #e7e9f1', borderRadius: 10, padding: '1rem' }

  return (
    <div style={{ margin: '0 0 2rem' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Nadzorna plošča kampanje</h2>

      {/* Statistika */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {CARDS.map((c) => (
          <div key={c.key} style={box}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f004e' }}>{stats ? stats[c.key] : '–'}</div>
            <div style={{ fontSize: 12, color: '#5b5f73' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Akcije */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginTop: 16 }}>
        <div style={box}>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Izvoz</h3>
          <p style={{ fontSize: 12, color: '#5b5f73', marginBottom: 10 }}>Seznam kandidatov v CSV (Excel).</p>
          <a href="/interno/kandidati-csv" className="btn btn--style-secondary btn--size-small" download>
            ⬇ Izvozi kandidate (CSV)
          </a>
        </div>

        <div style={box}>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Pošlji e-pošto kandidatom</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
            <option value="vsi">Vsi kandidati</option>
            <option value="brez_profila">Brez potrjenega profila</option>
            <option value="brez_dokumentov">Brez naloženih dokumentov</option>
            <optgroup label="Po kraju / volilnem območju">
              {KRAJI.filter((k) => !k.startsWith('Drugo')).map((k) => (
                <option key={k} value={`kraj:${k}`}>
                  Kraj: {k}
                </option>
              ))}
            </optgroup>
          </select>
          <select
            defaultValue="0"
            onChange={(e) => {
              const p = PREDLOGE[Number(e.target.value)]
              if (p) {
                setSubject(p.subject)
                setBodyText(p.body)
              }
            }}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          >
            {PREDLOGE.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Zadeva"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <textarea
            placeholder="Vsebina sporočila (HTML dovoljen)"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <label style={{ display: 'block', fontSize: 12, color: '#5b5f73', marginBottom: 4 }}>
            Priloge (neobvezno, skupaj do 15 MB):
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            style={{ width: '100%', marginBottom: 8, fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" disabled={sending} onClick={() => sendEmail(true)} className="btn btn--style-secondary btn--size-small">
              Testno (meni)
            </button>
            <button type="button" disabled={sending} onClick={() => sendEmail(false)} className="btn btn--style-primary btn--size-small">
              Pošlji vsem izbranim
            </button>
            {emailMsg && <span style={{ fontSize: 12, color: '#008288' }}>{emailMsg}</span>}
          </div>
        </div>
      </div>

      {/* Seznami zadnjih aktivnosti */}
      {seznami && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 16 }}>
          <div style={box}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Zadnje prijave kandidatov</h3>
            {seznami.zadnjiKandidati.length ? (
              seznami.zadnjiKandidati.map((k, i) => (
                <div key={i} style={{ fontSize: 13, padding: '3px 0', color: '#0f004e' }}>
                  {k.ime} {k.kraj && <span style={{ color: '#5b5f73' }}>· {k.kraj}</span>}
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#5b5f73' }}>Ni podatkov.</p>
            )}
          </div>
          <div style={box}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Zadnje pobude</h3>
            {seznami.zadnjePobude.length ? (
              seznami.zadnjePobude.map((p, i) => (
                <div key={i} style={{ fontSize: 13, padding: '3px 0', color: '#0f004e' }}>
                  {p.naslov} <span style={{ color: '#5b5f73' }}>· {p.kraj}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#5b5f73' }}>Ni podatkov.</p>
            )}
          </div>
          <div style={box}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Zadnja sporočila</h3>
            {seznami.zadnjaSporocila.length ? (
              seznami.zadnjaSporocila.map((s, i) => (
                <div key={i} style={{ fontSize: 13, padding: '3px 0', color: '#0f004e' }}>
                  {s.ime}
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#5b5f73' }}>Ni podatkov.</p>
            )}
          </div>
          <div style={box}>
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Čakajoče naloge</h3>
            {seznami.cakajoceNaloge.length ? (
              seznami.cakajoceNaloge.map((n, i) => (
                <div key={i} style={{ fontSize: 13, padding: '3px 0', color: '#0f004e' }}>
                  {n.naslov}
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#5b5f73' }}>Ni nalog.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
