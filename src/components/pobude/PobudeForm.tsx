'use client'

import { useRef, useState } from 'react'
import { Send, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import { POBUDA_KATEGORIJE, KRAJI } from '@/lib/pobude'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export default function PobudeForm({
  draft,
  kraj,
  onKrajChange,
  onClearDraft,
}: {
  draft: { lat: number; lng: number } | null
  kraj: string
  onKrajChange: (v: string) => void
  onClearDraft: () => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')

    if (!draft) {
      setStatus('error')
      setMessage('Označi lokacijo na zemljevidu (klikni na karto).')
      return
    }

    const form = e.currentTarget
    const data = new FormData(form)
    data.set('lat', String(draft.lat))
    data.set('lng', String(draft.lng))

    setStatus('sending')
    try {
      const res = await fetch('/pobude/oddaj', { method: 'POST', body: data })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setStatus('error')
        setMessage(json.error || 'Prišlo je do napake. Poskusi znova.')
        return
      }
      setStatus('ok')
      form.reset()
      onClearDraft()
    } catch {
      setStatus('error')
      setMessage('Povezava ni uspela. Preveri internet in poskusi znova.')
    }
  }

  if (status === 'ok') {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-white p-10 text-center shadow-card">
        <CheckCircle2 className="h-14 w-14 text-teal" strokeWidth={1.6} />
        <h3 className="mt-4 text-xl font-bold text-navy">Pobuda je oddana. Hvala!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Na tvoj e-naslov smo poslali potrditev. Pobudo bomo pregledali in po potrebi vključili v
          program.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 rounded-full border border-navy/25 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
        >
          Oddaj novo pobudo
        </button>
      </div>
    )
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20'
  const labelCls = 'block text-sm font-medium text-navy'

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-8"
    >
      <h3 className="text-xl font-bold text-navy">Oddaj pobudo</h3>
      <p className="mt-1 text-sm text-muted">Vsa polja z * so obvezna.</p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="kategorija">
              Kategorija *
            </label>
            <select id="kategorija" name="kategorija" required className={inputCls} defaultValue="">
              <option value="" disabled>
                Izberi kategorijo
              </option>
              {POBUDA_KATEGORIJE.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="kraj">
              Kraj *
            </label>
            <select
              id="kraj"
              name="kraj"
              required
              className={inputCls}
              value={kraj}
              onChange={(e) => onKrajChange(e.target.value)}
            >
              <option value="" disabled>
                Izberi kraj
              </option>
              {KRAJI.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            {draft && kraj && (
              <p className="mt-1 text-xs text-teal-700">Samodejno izbrano glede na lokacijo (lahko spremeniš).</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="naslov">
            Naslov pobude *
          </label>
          <input id="naslov" name="naslov" required minLength={3} className={inputCls} placeholder="Kratek naslov" />
        </div>

        <div>
          <label className={labelCls} htmlFor="opis">
            Opis težave ali predloga *
          </label>
          <textarea id="opis" name="opis" required minLength={10} rows={4} className={inputCls} placeholder="Opiši, za kaj gre in kaj predlagaš." />
        </div>

        {/* Lokacija (iz zemljevida) */}
        <div className="rounded-lg border border-dashed border-line bg-cloud px-3 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-navy">
            <MapPin className="h-4 w-4 text-teal" strokeWidth={2} />
            {draft ? (
              <span>
                Lokacija označena: {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
              </span>
            ) : (
              <span className="text-muted">Klikni na zemljevid in označi lokacijo *</span>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="foto">
            Fotografija (neobvezno)
          </label>
          <input id="foto" name="foto" type="file" accept="image/*" className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-cloud file:px-3 file:py-1.5 file:text-navy`} />
        </div>

        <hr className="border-line" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="imePriimek">
              Ime in priimek *
            </label>
            <input id="imePriimek" name="imePriimek" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="email">
              E-poštni naslov *
            </label>
            <input id="email" name="email" type="email" required className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="telefon">
            Telefon (neobvezno)
          </label>
          <input id="telefon" name="telefon" className={inputCls} />
        </div>

        {/* GDPR soglasja */}
        <label className="flex items-start gap-2.5 text-sm text-navy/90">
          <input type="checkbox" name="soglasjeGDPR" value="true" required className="mt-0.5 h-4 w-4 accent-[#00bbc1]" />
          <span>
            Soglašam z obdelavo osebnih podatkov za namen obravnave pobude. *{' '}
            <a href="/zasebnost" className="text-teal-700 underline">
              Politika zasebnosti
            </a>
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-sm text-navy/90">
          <input type="checkbox" name="dovoliJavnoObjavo" value="true" className="mt-0.5 h-4 w-4 accent-[#00bbc1]" />
          <span>Dovolim, da se pobuda anonimizirano prikaže na javnem zemljevidu.</span>
        </label>
      </div>

      {status === 'error' && message && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Pošiljam …
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={2} /> Pošlji pobudo
          </>
        )}
      </button>
    </form>
  )
}
