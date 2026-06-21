'use client'

import { useEffect, useState } from 'react'
import { VLOGE } from '@/access/roles'

type Prejemnik = { id: string | number; ime: string; email: string; vloga: string[] }

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
  const [kategorije, setKategorije] = useState<string[]>([])
  const [nacin, setNacin] = useState<'katera' | 'vse'>('katera')
  const [prejemniki, setPrejemniki] = useState<Prejemnik[] | null>(null)
  const [nalagam, setNalagam] = useState(false)
  const [izbiraNacin, setIzbiraNacin] = useState<'vsi' | 'posamezni'>('vsi')
  const [izbrani, setIzbrani] = useState<Set<string | number>>(new Set())
  const [subject, setSubject] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailOk, setEmailOk] = useState(false)
  const [sending, setSending] = useState(false)

  // Ob spremembi kategorij/načina je seznam prejemnikov zastarel – ponastavi.
  const ponastaviPrejemnike = () => {
    setPrejemniki(null)
    setIzbiraNacin('vsi')
    setIzbrani(new Set())
  }
  const toggleKategorija = (v: string) => {
    setKategorije((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
    ponastaviPrejemnike()
  }
  const toggleIzbran = (id: string | number) =>
    setIzbrani((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const prikaziPrejemnike = async () => {
    setNalagam(true)
    setEmailMsg('')
    try {
      const res = await fetch('/interno/prejemniki', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kategorije, nacin }),
      })
      const json = await res.json()
      if (json.ok) {
        setPrejemniki(json.users)
        setIzbrani(new Set(json.users.map((u: Prejemnik) => u.id))) // privzeto vsi izbrani
        setIzbiraNacin('vsi')
      } else setEmailMsg(json.error || 'Napaka pri nalaganju prejemnikov.')
    } catch {
      setEmailMsg('Povezava ni uspela.')
    } finally {
      setNalagam(false)
    }
  }

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

  const sendEmail = async () => {
    setSending(true)
    setEmailMsg('')
    setEmailOk(false)
    try {
      const fd = new FormData()
      fd.set('subject', subject)
      fd.set('body', bodyText)
      if (izbiraNacin === 'posamezni') fd.set('userIds', JSON.stringify(Array.from(izbrani)))
      else {
        fd.set('kategorije', JSON.stringify(kategorije))
        fd.set('nacin', nacin)
      }
      if (files) for (const f of Array.from(files)) fd.append('priloge', f)
      const res = await fetch('/interno/poslji-email', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setEmailOk(false)
        setEmailMsg(json.error || 'Napaka pri pošiljanju.')
      } else {
        setEmailOk(true)
        setEmailMsg(`✓ Poslano ${json.sent} ${json.sent === 1 ? 'prejemniku' : 'prejemnikom'}.`)
      }
    } catch {
      setEmailOk(false)
      setEmailMsg('Povezava ni uspela.')
    } finally {
      setSending(false)
    }
  }

  const box: React.CSSProperties = { border: '1px solid #e7e9f1', borderRadius: 10, padding: '1rem' }
  const inp: React.CSSProperties = {
    width: '100%',
    padding: '9px 11px',
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #e7e9f1',
    fontSize: 13,
    color: '#0f004e',
    background: '#fff',
    outline: 'none',
  }
  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#0f004e',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  }
  const seg = (active: boolean, accent = '#00bbc1'): React.CSSProperties => ({
    padding: '6px 13px',
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    background: active ? accent : '#fff',
    color: active ? '#fff' : '#33384a',
    fontWeight: active ? 600 : 500,
  })

  const liStyle: React.CSSProperties = { marginBottom: 6, lineHeight: 1.5 }
  const b = (t: string) => <strong style={{ color: '#0f004e' }}>{t}</strong>

  return (
    <div style={{ margin: '0 0 2rem' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Nadzorna plošča kampanje</h2>

      {/* Navodila za uporabo */}
      <details
        open
        style={{ border: '1px solid #cfe8ea', background: '#f0fbfb', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 16 }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#0f004e' }}>
          📖 Kako urejam stran (klikni za navodila)
        </summary>
        <div style={{ fontSize: 13, color: '#33384a', marginTop: 10 }}>
          <p style={{ marginBottom: 10 }}>
            V levem meniju so rubrike razdeljene v skupine. Spodaj je, kaj kje urejaš. Vsako polje
            ima pod sabo kratko razlago, gumb {b('Ustvari nov')} pa je desno zgoraj. Po urejanju vedno
            klikni {b('Save')} (Shrani).
          </p>

          <p style={{ fontWeight: 700, margin: '10px 0 4px' }}>Vsak dan</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li style={liStyle}>
              {b('Pobude')} (skupina »Pobude in sporočila«) — pregleduješ pobude občanov. Klikni
              pobudo → zavihek {b('Obravnava')} → za prikaz na zemljevidu obkljukaj »Prikaži na javnem
              zemljevidu«.
            </li>
            <li style={liStyle}>
              {b('Kontaktna sporočila')} in {b('Prijave za sodelovanje')} — samo za branje (vnašajo
              jih obiskovalci).
            </li>
          </ul>

          <p style={{ fontWeight: 700, margin: '10px 0 4px' }}>Vsebina strani (skupina »Javna vsebina«)</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li style={liStyle}>{b('Domača stran')} — naslov, opis in fotografija na vrhu strani.</li>
            <li style={liStyle}>{b('Novice')} — objaviš novico/obvestilo (»Ustvari nov«).</li>
            <li style={liStyle}>{b('Ekipa')} — člani, prikazani na strani »Demokrati Radovljica«.</li>
            <li style={liStyle}>
              {b('Lokalne volitve')}: v {b('Nastavitvah')} najprej izbereš »kandidat za župana + lista« ali »samo
              občinski svet«. {b('Kandidat za župana')} (global) uredi in obkljukaj »Objavi«.
              {b('Kandidati za svetnike')} — dodajaš člane liste (»Ustvari nov«); vsak dobi svojo podstran.
            </li>
            <li style={liStyle}>{b('Nastavitve')} — tip volitev, kontakt, družbena omrežja, poslanstvo, vrednote.</li>
            <li style={liStyle}>
              {b('Program')} in {b('Kraji')} — besedila so že vpisana; urejaš jih po želji.
            </li>
          </ul>

          <p style={{ fontWeight: 700, margin: '10px 0 4px' }}>Kandidati (skupina »Kandidati«)</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li style={liStyle}>
              {b('Uporabniki sistema')} — dodaš uporabnika/kandidata (»Ustvari nov«): e-pošta, geslo,
              izbereš eno ali več vlog (član, kandidat za svetnika …). Uporabnik se nato prijavi in ureja svoj profil.
            </li>
          </ul>
        </div>
      </details>

      {/* Statistika */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {CARDS.map((c) => (
          <div key={c.key} style={box}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f004e' }}>{stats ? stats[c.key] : '–'}</div>
            <div style={{ fontSize: 12, color: '#5b5f73' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Izvoz */}
      <div style={{ ...box, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontWeight: 700, margin: 0 }}>Izvoz kandidatov</h3>
          <p style={{ fontSize: 12, color: '#5b5f73', margin: '4px 0 0' }}>Seznam kandidatov v CSV (Excel).</p>
        </div>
        <a href="/interno/kandidati-csv" className="btn btn--style-secondary btn--size-small" download>
          ⬇ Izvozi (CSV)
        </a>
      </div>

      {/* Pošiljanje e-pošte */}
      <div style={{ ...box, marginTop: 16, padding: '1.25rem 1.25rem 1.5rem' }}>
        <h3 style={{ fontWeight: 700, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden>✉️</span> Pošlji e-pošto
        </h3>
        <p style={{ fontSize: 12.5, color: '#5b5f73', margin: '0 0 18px' }}>Izberi komu, napiši sporočilo in pošlji.</p>

        {/* Korak 1 – komu */}
        <div style={sectionLabel}>1 · Komu</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {VLOGE.map((v) => {
            const on = kategorije.includes(v.value)
            return (
              <button
                key={v.value}
                type="button"
                onClick={() => toggleKategorija(v.value)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 999,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: on ? 600 : 500,
                  border: on ? '1px solid #00bbc1' : '1px solid #e7e9f1',
                  background: on ? '#00bbc1' : '#fff',
                  color: on ? '#fff' : '#33384a',
                  transition: 'all .15s',
                }}
              >
                {v.label}
              </button>
            )
          })}
        </div>


        {/* Korak 2 – prejemniki */}
        <div style={{ ...sectionLabel, marginTop: 20 }}>2 · Prejemniki</div>
        <button type="button" disabled={nalagam} onClick={prikaziPrejemnike} className="btn btn--style-secondary btn--size-small">
          {nalagam ? 'Nalagam …' : prejemniki ? '↻ Osveži prejemnike' : 'Prikaži prejemnike'}
        </button>

        {prejemniki && (
          <div style={{ marginTop: 10, border: '1px solid #e7e9f1', borderRadius: 10, padding: 12, background: '#fbfcfe' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f004e', marginBottom: prejemniki.length ? 10 : 0 }}>
              Ustreza {prejemniki.length} {prejemniki.length === 1 ? 'oseba' : 'oseb'}.
            </div>
            {prejemniki.length > 0 && (
              <>
                <div style={{ display: 'inline-flex', border: '1px solid #e7e9f1', borderRadius: 8, overflow: 'hidden' }}>
                  <button type="button" onClick={() => setIzbiraNacin('vsi')} style={seg(izbiraNacin === 'vsi')}>
                    Vsi ({prejemniki.length})
                  </button>
                  <button type="button" onClick={() => setIzbiraNacin('posamezni')} style={seg(izbiraNacin === 'posamezni')}>
                    Posamezni
                  </button>
                </div>
                {izbiraNacin === 'posamezni' && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ maxHeight: 190, overflowY: 'auto', border: '1px solid #eef0f5', borderRadius: 8, background: '#fff' }}>
                      {prejemniki.map((u) => {
                        const on = izbrani.has(u.id)
                        return (
                          <label
                            key={u.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              fontSize: 13,
                              padding: '7px 10px',
                              borderBottom: '1px solid #f4f6fa',
                              cursor: 'pointer',
                              background: on ? '#f0fbfb' : '#fff',
                            }}
                          >
                            <input type="checkbox" checked={on} onChange={() => toggleIzbran(u.id)} />
                            <span style={{ color: '#0f004e', fontWeight: 500 }}>{u.ime}</span>
                            <span style={{ color: '#5b5f73', marginLeft: 'auto' }}>{u.email}</span>
                          </label>
                        )
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: '#5b5f73', marginTop: 6 }}>
                      Izbranih: {izbrani.size} od {prejemniki.length}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Korak 3 – sporočilo */}
        <div style={{ ...sectionLabel, marginTop: 20 }}>3 · Sporočilo</div>
        <select
          defaultValue="0"
          onChange={(e) => {
            const p = PREDLOGE[Number(e.target.value)]
            if (p) {
              setSubject(p.subject)
              setBodyText(p.body)
            }
          }}
          style={inp}
        >
          {PREDLOGE.map((p, i) => (
            <option key={i} value={i}>
              {p.label}
            </option>
          ))}
        </select>
        <input placeholder="Zadeva" value={subject} onChange={(e) => setSubject(e.target.value)} style={inp} />
        <textarea
          placeholder="Vsebina sporočila (lahko vključuje HTML)"
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={5}
          style={{ ...inp, resize: 'vertical' }}
        />
        <label style={{ display: 'block', fontSize: 12, color: '#5b5f73', marginBottom: 5 }}>Priloge (neobvezno, skupaj do 15 MB):</label>
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} style={{ width: '100%', marginBottom: 16, fontSize: 13 }} />

        <button
          type="button"
          disabled={sending || (izbiraNacin === 'posamezni' && izbrani.size === 0)}
          onClick={sendEmail}
          className="btn btn--style-primary"
        >
          {sending ? 'Pošiljam …' : izbiraNacin === 'posamezni' ? `Pošlji ${izbrani.size} izbranim` : 'Pošlji sporočilo'}
        </button>

        {emailMsg && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              background: emailOk ? '#e8f8ee' : '#fdecee',
              color: emailOk ? '#157a43' : '#b00020',
              border: `1px solid ${emailOk ? '#bfe8cd' : '#f3c2c8'}`,
            }}
          >
            {emailMsg}
          </div>
        )}
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
