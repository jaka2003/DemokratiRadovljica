'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

import PobudeForm from './PobudeForm'
import type { JavnaPobuda } from './PobudeMap'
import { POBUDA_KATEGORIJE, nearestKraj } from '@/lib/pobude'

// Leaflet potrebuje brskalnik – uvozimo brez SSR.
const PobudeMap = dynamic(() => import('./PobudeMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-cloud text-muted">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Nalagam zemljevid …
    </div>
  ),
})

export default function PobudeModul() {
  const [pobude, setPobude] = useState<JavnaPobuda[]>([])
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null)
  const [kraj, setKraj] = useState('')

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
  }, [])

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* Leva polovica: zemljevid + legenda */}
      <div className="lg:sticky lg:top-20">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line shadow-card">
          <PobudeMap pobude={pobude} draft={draft} onPick={onPick} />
        </div>

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
