'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const KEY = 'demokrati_piskotki_ok'

// Informativno obvestilo o piškotkih. Stran uporablja SAMO nujne piškotke (prijava, varnost),
// zato po EU/GDPR zadošča obvestilo (brez privolitvenega »Sprejmi/Zavrni« orodja).
export function PiskotkiObvestilo() {
  const [pokazi, setPokazi] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setPokazi(true)
    } catch {
      setPokazi(true)
    }
  }, [])

  const zapri = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* npr. zaseben način – neusodno */
    }
    setPokazi(false)
  }

  if (!pokazi) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-2.5">
        <span className="text-xl leading-none" aria-hidden>
          🍪
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-navy">Piškotki</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Ta stran uporablja samo <strong>nujne piškotke</strong> za delovanje (prijava, varnost). Brez sledenja,
            analitike in oglaševanja.{' '}
            <a href="/zasebnost" className="font-semibold text-teal-700 underline">
              Več o zasebnosti
            </a>
            .
          </p>
          <button
            type="button"
            onClick={zapri}
            className="mt-3 rounded-full bg-teal px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            Razumem
          </button>
        </div>
        <button type="button" onClick={zapri} aria-label="Zapri" className="text-muted transition-colors hover:text-navy">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
