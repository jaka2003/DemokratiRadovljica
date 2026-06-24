'use client'

import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { HONEYPOT } from '@/lib/spam'

// Obrazec za oddajo vprašanja občana. E-naslov je neobvezen (le za obvestilo o odgovoru).
export function VprasanjeForm() {
  const [stanje, setStanje] = useState<'idle' | 'poslji' | 'ok'>('idle')
  const [napaka, setNapaka] = useState('')
  const [imaEmail, setImaEmail] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const obrazec = e.currentTarget
    setStanje('poslji')
    setNapaka('')
    try {
      const res = await fetch('/vprasanja/oddaj', { method: 'POST', body: new FormData(obrazec) })
      const d = await res.json()
      if (d.ok) {
        setStanje('ok')
        obrazec.reset()
        setImaEmail(false)
      } else {
        setStanje('idle')
        setNapaka(d.error || 'Vprašanja ni bilo mogoče poslati.')
      }
    } catch {
      setStanje('idle')
      setNapaka('Povezava ni uspela. Poskusi znova.')
    }
  }

  if (stanje === 'ok') {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-12 w-12 text-teal" strokeWidth={1.8} />
        <h3 className="mt-3 text-xl font-bold text-navy">Hvala za vaše vprašanje!</h3>
        <p className="mt-2 text-sm text-muted">
          Ekipa ga bo pregledala in pripravila odgovor. Če ste pustili e-naslov, vas obvestimo, ko bo objavljen.
        </p>
        <button
          type="button"
          onClick={() => setStanje('idle')}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Postavi novo vprašanje
        </button>
      </div>
    )
  }

  const polje = 'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal'

  return (
    <form onSubmit={onSubmit} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-8">
      <h3 className="text-xl font-bold text-navy">Imate vprašanje za ekipo?</h3>
      <p className="mt-1.5 text-sm text-muted">
        Postavite ga spodaj. Na izbrana vprašanja javno odgovorimo, da koristi vsem občanom.
      </p>

      {/* Honeypot – skrito pred uporabnikom */}
      <input
        type="text"
        name={HONEYPOT}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">Vaše vprašanje *</label>
          <textarea
            name="vprasanje"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            placeholder="Npr.: Kako nameravate urediti parkiranje v centru Radovljice?"
            className={`${polje} resize-y`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">Ime (neobvezno)</label>
          <input type="text" name="imeObcana" placeholder="Ime in priimek ali vzdevek" className={polje} />
          <label className="mt-2 flex items-start gap-2 text-sm text-navy/80">
            <input type="checkbox" name="prikaziIme" className="mt-0.5 h-4 w-4 accent-teal" />
            <span>Dovolim, da se moje ime objavi ob vprašanju. (Sicer objavimo anonimno.)</span>
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">E-naslov (neobvezno)</label>
          <input
            type="email"
            name="email"
            placeholder="vas@email.si"
            onChange={(e) => setImaEmail(e.target.value.trim().length > 0)}
            className={polje}
          />
          <p className="mt-1 text-xs text-muted">Uporabimo ga samo, da vas obvestimo, ko objavimo odgovor. Ni javen.</p>
          {imaEmail && (
            <label className="mt-2 flex items-start gap-2 text-sm text-navy/80">
              <input type="checkbox" name="soglasjeGDPR" className="mt-0.5 h-4 w-4 accent-teal" />
              <span>
                Soglašam z obdelavo e-naslova za namen obvestila o odgovoru.{' '}
                <a href="/zasebnost" target="_blank" className="text-teal-700 underline">
                  Zasebnost
                </a>
              </span>
            </label>
          )}
        </div>
      </div>

      {napaka && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{napaka}</p>}

      <button
        type="submit"
        disabled={stanje === 'poslji'}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-4 w-4" strokeWidth={2} />
        {stanje === 'poslji' ? 'Pošiljam …' : 'Pošlji vprašanje'}
      </button>
    </form>
  )
}
