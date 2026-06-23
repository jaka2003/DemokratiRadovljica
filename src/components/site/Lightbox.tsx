'use client'

import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Povečan prikaz slik (lightbox) z navigacijo med vsemi slikami pobude/mesta.
export function Lightbox({
  slike,
  index,
  onIndex,
  onClose,
}: {
  slike: string[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const n = slike.length
  const vec = n > 1
  const prej = () => onIndex((index - 1 + n) % n)
  const naprej = () => onIndex((index + 1) % n)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && vec) prej()
      else if (e.key === 'ArrowRight' && vec) naprej()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, n])

  const krozec: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <button onClick={onClose} aria-label="Zapri" style={{ ...krozec, top: 16, right: 16 }}>
        <X className="h-5 w-5" strokeWidth={2} />
      </button>

      {vec && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            prej()
          }}
          aria-label="Prejšnja"
          style={{ ...krozec, left: 16, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slike[index]}
        alt={`Slika ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }}
      />

      {vec && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            naprej()
          }}
          aria-label="Naslednja"
          style={{ ...krozec, right: 16, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {vec && (
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            background: 'rgba(255,255,255,0.15)',
            padding: '4px 12px',
            borderRadius: 999,
          }}
        >
          {index + 1} / {n}
        </div>
      )}
    </div>
  )
}
