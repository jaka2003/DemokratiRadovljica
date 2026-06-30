'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export type HeroSlide = { url: string; alt?: string; width?: number; height?: number }

// Moderni hero carousel: nežno prelivanje (crossfade), pike za navigacijo,
// pavza ob prehodu miške, upošteva nastavitev za zmanjšano gibanje.
// Slike se prikažejo v CELOTI (object-contain) – nič se ne obreže.
export function HeroCarousel({
  slides,
  intervalMs = 3000,
  povezava,
}: {
  slides: HeroSlide[]
  intervalMs?: number
  povezava?: string
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = slides.length
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (n <= 1 || paused) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    timer.current = setInterval(() => setIndex((p) => (p + 1) % n), Math.max(2000, intervalMs))
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [n, paused, intervalMs])

  // Razmerje določa prva (glavna) slika; ostale se vklopijo vanjo brez obrezovanja.
  const first = slides[0]
  const ratio = first?.width && first?.height ? `${first.width} / ${first.height}` : '4 / 3'

  return (
    <div
      className="relative w-full overflow-hidden rounded-[var(--radius-card)] bg-cloud shadow-card"
      style={{ aspectRatio: ratio }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Sloj slik – po želji clickable (povezava). Pike za navigacijo so nad njim (z-10). */}
      {(() => {
        const slikePlast = slides.map((s, idx) => (
          <Image
            key={`${s.url}-${idx}`}
            src={s.url}
            alt={s.alt || 'Demokrati Radovljica'}
            fill
            priority={idx === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-contain transition-opacity duration-700 ease-in-out ${
              idx === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))
        return povezava ? (
          <a href={povezava} aria-label="Odpri povezavo" className="absolute inset-0 z-0 block">
            {slikePlast}
          </a>
        ) : (
          slikePlast
        )
      })()}

      {n > 1 && (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
          <div className="flex items-center gap-1 rounded-full bg-white/65 px-2 py-1 shadow-sm backdrop-blur">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Pokaži sliko ${idx + 1}`}
                aria-current={idx === index}
                onClick={() => setIndex(idx)}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    idx === index ? 'w-6 bg-navy' : 'w-2 bg-navy/30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
