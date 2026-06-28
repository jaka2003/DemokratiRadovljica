'use client'

import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { HONEYPOT } from '@/lib/spam'
import { SPOL_OPCIJE, POSTA_OPCIJE, IZOBRAZBA_OPCIJE } from '@/lib/pristop'

const polje = 'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal'
const oznaka = 'mb-1.5 block text-sm font-semibold text-navy'

function Naslov({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-2 border-b border-line pb-1.5 text-xs font-bold uppercase tracking-wide text-teal-700">{children}</h3>
}

export function PristopForm() {
  const [stanje, setStanje] = useState<'idle' | 'poslji'>('idle')
  const [napaka, setNapaka] = useState('')
  const [koncano, setKoncano] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const obrazec = e.currentTarget
    setStanje('poslji')
    setNapaka('')
    try {
      const res = await fetch('/pristop/oddaj', { method: 'POST', body: new FormData(obrazec) })
      const d = await res.json()
      if (d.ok) {
        setKoncano(true)
        obrazec.reset()
      } else {
        setNapaka(d.error || 'Izjave ni bilo mogoče oddati.')
      }
    } catch {
      setNapaka('Povezava ni uspela. Poskusi znova.')
    } finally {
      setStanje('idle')
    }
  }

  if (koncano) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-12 w-12 text-teal" strokeWidth={1.8} />
        <h3 className="mt-3 text-xl font-bold text-navy">Hvala za pristopno izjavo!</h3>
        <p className="mt-2 text-sm text-muted">Tvojo prošnjo za včlanitev bomo pregledali in te obvestili na e-naslov.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-8">
      <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      {/* Osebni podatki */}
      <Naslov>Osebni podatki</Naslov>
      <div className="space-y-4">
        <div>
          <label className={oznaka}>Ime in priimek *</label>
          <input name="imePriimek" required className={polje} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={oznaka}>Datum rojstva *</label>
            <input type="date" name="datumRojstva" required className={polje} />
          </div>
          <div>
            <label className={oznaka}>Spol *</label>
            <div className="flex gap-5 pt-2">
              {SPOL_OPCIJE.map((s) => (
                <label key={s.value} className="flex items-center gap-2 text-sm text-navy">
                  <input type="radio" name="spol" value={s.value} required className="h-4 w-4 accent-teal" /> {s.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={oznaka}>E-naslov *</label>
            <input type="email" name="email" required className={polje} />
          </div>
          <div>
            <label className={oznaka}>Mobilni telefon</label>
            <input name="mobilniTelefon" defaultValue="+386" className={polje} />
          </div>
        </div>
        <div className="sm:max-w-[calc(50%-0.5rem)]">
          <label className={oznaka}>Telefon</label>
          <input name="telefon" defaultValue="+386" className={polje} />
        </div>
      </div>

      {/* Stalno prebivališče */}
      <div className="mt-6">
        <Naslov>Stalno prebivališče</Naslov>
        <div className="space-y-4">
          <div>
            <label className={oznaka}>Naslov *</label>
            <input name="stalniNaslov" required placeholder="Ulica in hišna številka" className={polje} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={oznaka}>Mesto *</label>
              <input name="stalnoMesto" required className={polje} />
            </div>
            <div>
              <label className={oznaka}>Poštna številka *</label>
              <input name="stalnaPosta" required className={polje} />
            </div>
          </div>
        </div>
      </div>

      {/* Začasno prebivališče */}
      <div className="mt-6">
        <Naslov>Začasno prebivališče (neobvezno)</Naslov>
        <div className="space-y-4">
          <div>
            <label className={oznaka}>Naslov</label>
            <input name="zacasniNaslov" className={polje} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={oznaka}>Mesto</label>
              <input name="zacasnoMesto" className={polje} />
            </div>
            <div>
              <label className={oznaka}>Poštna številka</label>
              <input name="zacasnaPosta" className={polje} />
            </div>
          </div>
        </div>
      </div>

      {/* Pošta */}
      <div className="mt-6">
        <label className={oznaka}>Pošto želim prejemati na *</label>
        <div className="flex flex-wrap gap-5 pt-1">
          {POSTA_OPCIJE.map((p, i) => (
            <label key={p.value} className="flex items-center gap-2 text-sm text-navy">
              <input type="radio" name="postaNa" value={p.value} required defaultChecked={i === 0} className="h-4 w-4 accent-teal" /> {p.label}
            </label>
          ))}
        </div>
      </div>

      {/* Zaposlitev */}
      <div className="mt-6">
        <Naslov>Zaposlitev in izobrazba</Naslov>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={oznaka}>Poklic *</label>
              <input name="poklic" required className={polje} />
            </div>
            <div>
              <label className={oznaka}>Delovno mesto *</label>
              <input name="delovnoMesto" required className={polje} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={oznaka}>Podjetje *</label>
              <input name="podjetje" required placeholder="Zaposlitveno podjetje" className={polje} />
            </div>
            <div>
              <label className={oznaka}>Sedež zaposlitve</label>
              <input name="sedezZaposlitve" className={polje} />
            </div>
          </div>
          <div className="sm:max-w-[calc(50%-0.5rem)]">
            <label className={oznaka}>Izobrazba</label>
            <select name="izobrazba" defaultValue="" className={polje}>
              <option value="">— Izberi —</option>
              {IZOBRAZBA_OPCIJE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* GDPR */}
      <label className="mt-6 flex items-start gap-2.5 text-sm text-navy/85">
        <input type="checkbox" name="soglasjeGDPR" required className="mt-0.5 h-4 w-4 accent-teal" />
        <span>
          Soglašam z obdelavo osebnih podatkov za namen članstva (GDPR). *{' '}
          <a href="/zasebnost" target="_blank" className="text-teal-700 underline">
            Zasebnost
          </a>
        </span>
      </label>

      {napaka && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{napaka}</p>}

      <button
        type="submit"
        disabled={stanje === 'poslji'}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-4 w-4" strokeWidth={2} /> {stanje === 'poslji' ? 'Pošiljam …' : 'Oddaj pristopno izjavo'}
      </button>
    </form>
  )
}
