'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, LocateFixed, Camera, ImagePlus, X, Send, CheckCircle2, MapPin } from 'lucide-react'

import type { JavnaPobuda, MestoTocka } from '@/components/pobude/PobudeMap'
import { KRAJI, nearestKraj } from '@/lib/pobude'
import { inObcina } from '@/lib/obcina'

const PobudeMap = dynamic(() => import('@/components/pobude/PobudeMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-cloud text-muted">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Nalagam zemljevid …
    </div>
  ),
})

type GeoStanje = 'idle' | 'iscem' | 'zunaj' | 'zavrnjeno' | 'napaka'
type Status = 'idle' | 'sending' | 'ok' | 'error'
const MAX_FOTO = 4

export default function PlakatModul() {
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null)
  const [kraj, setKraj] = useState('')
  const [focus, setFocus] = useState<{ lat: number; lng: number; key: number } | null>(null)
  const [geo, setGeo] = useState<GeoStanje>('idle')

  const [naslov, setNaslov] = useState('')
  const [opis, setOpis] = useState('')
  const [fotos, setFotos] = useState<{ file: File; url: string }[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [mesta, setMesta] = useState<MestoTocka[]>([])

  // Naloži že oddana plakatna mesta za prikaz na zemljevidu (ob vstopu in po oddaji).
  const naloziMesta = useCallback(() => {
    fetch('/interno/plakat/seznam', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.mesta)) setMesta(d.mesta)
      })
      .catch(() => {})
  }, [])
  useEffect(() => {
    naloziMesta()
  }, [naloziMesta])

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const fotosRef = useRef<{ file: File; url: string }[]>([])
  fotosRef.current = fotos
  useEffect(() => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])

  const onPick = useCallback((lat: number, lng: number) => {
    setDraft({ lat, lng })
    setKraj(nearestKraj(lat, lng))
  }, [])

  const uporabiLokacijo = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeo('napaka')
      return
    }
    setGeo('iscem')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        if (inObcina(lat, lng)) {
          setDraft({ lat, lng })
          setKraj(nearestKraj(lat, lng))
          setFocus({ lat, lng, key: pos.timestamp })
          setGeo('idle')
        } else setGeo('zunaj')
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? 'zavrnjeno' : 'napaka'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }, [])

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    setFotos((prev) => {
      const room = MAX_FOTO - prev.length
      if (room <= 0) return prev
      const incoming = Array.from(list)
        .slice(0, room)
        .map((file) => ({ file, url: URL.createObjectURL(file) }))
      return [...prev, ...incoming]
    })
  }
  function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files)
    e.target.value = ''
  }
  function removeFoto(i: number) {
    setFotos((prev) => {
      const f = prev[i]
      if (f) URL.revokeObjectURL(f.url)
      return prev.filter((_, idx) => idx !== i)
    })
  }
  function clearFotos() {
    fotosRef.current.forEach((f) => URL.revokeObjectURL(f.url))
    setFotos([])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    if (!draft) {
      setStatus('error')
      setMessage('Označi lokacijo na zemljevidu (ali uporabi svojo lokacijo).')
      return
    }
    const fd = new FormData()
    fd.set('naslov', naslov)
    fd.set('opis', opis)
    fd.set('kraj', kraj)
    fd.set('lat', String(draft.lat))
    fd.set('lng', String(draft.lng))
    fotos.forEach((f) => fd.append('foto', f.file))

    setStatus('sending')
    try {
      const res = await fetch('/interno/plakat/oddaj', { method: 'POST', credentials: 'include', body: fd })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setStatus('error')
        setMessage(json.error || 'Prišlo je do napake. Poskusi znova.')
        return
      }
      setStatus('ok')
      setNaslov('')
      setOpis('')
      setKraj('')
      setDraft(null)
      clearFotos()
      naloziMesta()
    } catch {
      setStatus('error')
      setMessage('Povezava ni uspela. Preveri internet in poskusi znova.')
    }
  }

  if (status === 'ok') {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-white p-10 text-center shadow-card">
        <CheckCircle2 className="h-14 w-14 text-teal" strokeWidth={1.6} />
        <h3 className="mt-4 text-xl font-bold text-navy">Predlog je oddan. Hvala!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">Ekipa kampanje bo lokacijo pregledala.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 rounded-full border border-navy/25 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
        >
          Predlagaj novo mesto
        </button>
      </div>
    )
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20'
  const labelCls = 'block text-sm font-medium text-navy'

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* Zemljevid + GPS */}
      <div className="lg:sticky lg:top-20">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line shadow-card">
          <PobudeMap pobude={[] as JavnaPobuda[]} mesta={mesta} draft={draft} focus={focus} onPick={onPick} draftLabel="Predlagana lokacija plakata (povleci za premik)" />
        </div>
        <button
          type="button"
          onClick={uporabiLokacijo}
          disabled={geo === 'iscem'}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-sm transition-colors hover:border-teal hover:text-teal disabled:opacity-60 sm:w-auto"
        >
          {geo === 'iscem' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          {geo === 'iscem' ? 'Iščem lokacijo …' : 'Uporabi mojo lokacijo'}
        </button>
        {geo === 'zunaj' && (
          <p className="mt-2 text-xs text-amber-700">Tvoja lokacija je izven občine Radovljica. Označi točko na zemljevidu ročno.</p>
        )}
        {geo === 'zavrnjeno' && (
          <p className="mt-2 text-xs text-amber-700">Dostop do lokacije ni dovoljen. Označi točko na zemljevidu ročno.</p>
        )}
        {geo === 'napaka' && (
          <p className="mt-2 text-xs text-amber-700">Lokacije ni bilo mogoče pridobiti. Označi točko na zemljevidu ročno.</p>
        )}
        {mesta.length > 0 && (
          <p className="mt-3 text-xs text-muted">
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: '#0f004e' }} />
            Temni pini so že oddana mesta ({mesta.length}) — klikni nanje za fotografijo in podatke.
          </p>
        )}
      </div>

      {/* Obrazec */}
      <form onSubmit={handleSubmit} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-8">
        <h3 className="text-xl font-bold text-navy">Predlagaj plakatno mesto</h3>
        <p className="mt-1 text-sm text-muted">Označi lokacijo, dodaj fotografijo in pošlji predlog.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={labelCls} htmlFor="naslov">
              Kratek opis lokacije *
            </label>
            <input id="naslov" required minLength={3} value={naslov} onChange={(e) => setNaslov(e.target.value)} className={inputCls} placeholder="Npr. ob glavni cesti pri trgovini" />
          </div>

          <div>
            <label className={labelCls} htmlFor="kraj">
              Kraj
            </label>
            <select id="kraj" value={kraj} onChange={(e) => setKraj(e.target.value)} className={inputCls}>
              <option value="">Izberi kraj (ali se izpolni samodejno)</option>
              {KRAJI.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="opis">
              Zakaj je primerno (neobvezno)
            </label>
            <textarea id="opis" rows={3} value={opis} onChange={(e) => setOpis(e.target.value)} className={inputCls} placeholder="Npr. veliko prometa, dobro vidno, prosta površina." />
          </div>

          {/* Lokacija */}
          <div className="rounded-lg border border-dashed border-line bg-cloud px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2 text-navy">
              <MapPin className="h-4 w-4 text-teal" strokeWidth={2} />
              {draft ? (
                <span>Lokacija označena: {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}</span>
              ) : (
                <span className="text-muted">Označi lokacijo na zemljevidu *</span>
              )}
            </div>
          </div>

          {/* Fotografije */}
          <div>
            <label className={labelCls}>Fotografije lokacije (neobvezno)</label>
            <p className="mt-0.5 text-xs text-muted">Fotografiraj kar s telefonom ali naloži obstoječe (do {MAX_FOTO}).</p>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFotoChange} />
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onFotoChange} />

            {fotos.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {fotos.map((f, i) => (
                  <div key={f.url} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-cloud">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={`Fotografija ${i + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeFoto(i)} aria-label={`Odstrani fotografijo ${i + 1}`} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy/85 text-white shadow transition-colors hover:bg-navy">
                      <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fotos.length < MAX_FOTO && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => cameraRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-sm transition-colors hover:border-teal hover:text-teal">
                  <Camera className="h-4 w-4" strokeWidth={2} /> Fotografiraj
                </button>
                <button type="button" onClick={() => galleryRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-sm transition-colors hover:border-teal hover:text-teal">
                  <ImagePlus className="h-4 w-4" strokeWidth={2} /> Iz galerije
                </button>
                {fotos.length > 0 && <span className="text-xs text-muted">{fotos.length}/{MAX_FOTO}</span>}
              </div>
            )}
          </div>
        </div>

        {status === 'error' && message && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{message}</p>
        )}

        <button type="submit" disabled={status === 'sending'} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60">
          {status === 'sending' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Pošiljam …
            </>
          ) : (
            <>
              <Send className="h-4 w-4" strokeWidth={2} /> Pošlji predlog
            </>
          )}
        </button>
      </form>
    </div>
  )
}
