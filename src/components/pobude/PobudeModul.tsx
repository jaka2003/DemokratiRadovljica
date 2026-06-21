'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, LocateFixed } from 'lucide-react'

import PobudeForm from './PobudeForm'
import type { JavnaPobuda } from './PobudeMap'
import { POBUDA_KATEGORIJE, nearestKraj } from '@/lib/pobude'
import { inObcina } from '@/lib/obcina'

// Leaflet potrebuje brskalnik – uvozimo brez SSR.
const PobudeMap = dynamic(() => import('./PobudeMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-cloud text-muted">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Nalagam zemljevid …
    </div>
  ),
})

type GeoStanje = 'idle' | 'iscem' | 'zunaj' | 'zavrnjeno' | 'napaka'

export default function PobudeModul() {
  const [pobude, setPobude] = useState<JavnaPobuda[]>([])
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null)
  const [kraj, setKraj] = useState('')
  const [focus, setFocus] = useState<{ lat: number; lng: number; key: number } | null>(null)
  const [geo, setGeo] = useState<GeoStanje>('idle')

  useEffect(() => {
    let active = true
    fetch('/pobude/javne', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d.pobude)) setPobude(d.pobude)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const onPick = useCallback((lat: number, lng: number) => {
    setDraft({ lat, lng })
    // Samodejno izberi najbližji kraj.
    setKraj(nearestKraj(lat, lng))
  }, [])
  const onClearDraft = useCallback(() => {
    setDraft(null)
    setKraj('')
    setGeo('idle')
  }, [])

  // Gumb »Uporabi mojo lokacijo« – GPS naprave (deluje na telefonu in računalniku).
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
        } else {
          setGeo('zunaj')
        }
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? 'zavrnjeno' : 'napaka'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }, [])

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* Leva polovica: zemljevid + legenda */}
      <div className="lg:sticky lg:top-20">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line shadow-card">
          <PobudeMap pobude={pobude} draft={draft} focus={focus} onPick={onPick} />
        </div>

        {/* Uporabi lokacijo naprave (telefon/računalnik) */}
        <button
          type="button"
          onClick={uporabiLokacijo}
          disabled={geo === 'iscem'}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-sm transition hover:border-teal hover:text-teal disabled:opacity-60 sm:w-auto"
        >
          {geo === 'iscem' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {geo === 'iscem' ? 'Iščem lokacijo …' : 'Uporabi mojo lokacijo'}
        </button>
        {geo === 'zunaj' && (
          <p className="mt-2 text-xs text-amber-700">
            Tvoja trenutna lokacija je izven občine Radovljica. Označi točko na zemljevidu ročno.
          </p>
        )}
        {geo === 'zavrnjeno' && (
          <p className="mt-2 text-xs text-amber-700">
            Dostop do lokacije ni dovoljen. V brskalniku dovoli lokacijo ali označi točko na zemljevidu ročno.
          </p>
        )}
        {geo === 'napaka' && (
          <p className="mt-2 text-xs text-amber-700">
            Lokacije ni bilo mogoče pridobiti. Označi točko na zemljevidu ročno.
          </p>
        )}

        {/* Legenda kategorij */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 rounded-[var(--radius-card)] border border-line bg-white p-4">
          {POBUDA_KATEGORIJE.map((k) => (
            <span key={k.value} className="flex items-center gap-1.5 text-xs text-navy/80">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: k.color }} />
              {k.label}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Na zemljevidu so prikazane le odobrene, anonimizirane pobude. Osebni podatki predlagateljev
          niso nikoli javno vidni.
        </p>
      </div>

      {/* Desna polovica: obrazec */}
      <PobudeForm draft={draft} kraj={kraj} onKrajChange={setKraj} onClearDraft={onClearDraft} />
    </div>
  )
}
