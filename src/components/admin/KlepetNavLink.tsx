'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BRANJE_KEY, kljucDm, kljucSobe, nalozjBranje, shraniBranje } from '../klepet/branje'

// Povezava do klepeta v stranskem meniju administracije z značko neprebranih sporočil.
// Število neprebranih izračunamo iz pregleda in lokalno shranjenih »prebranih« ID-jev.
export function KlepetNavLink() {
  const [neprebrano, setNeprebrano] = useState(0)

  useEffect(() => {
    let zivo = true
    const preveri = async () => {
      try {
        const r = await fetch('/interno/klepet/pregled', { credentials: 'include' })
        if (!r.ok) return
        const d = await r.json()
        if (!zivo || !d.ok) return
        const branje = nalozjBranje()
        const prvic = Object.keys(branje).length === 0
        const novo: Record<string, number> = { ...branje }
        let n = 0
        for (const s of d.sobe || []) {
          const k = kljucSobe(s.kljuc)
          if (prvic) novo[k] = s.zadnjiId
          else if (s.zadnjiId > (branje[k] || 0)) n++
        }
        for (const p of d.pogovori || []) {
          const k = kljucDm(p.uporabnikId)
          if (prvic) novo[k] = p.zadnjiId
          else if (!p.odMene && p.zadnjiId > (branje[k] || 0)) n++
        }
        // Ob prvem obisku označimo vse za prebrano (da ne »zagori« vse naenkrat).
        if (prvic) shraniBranje(novo)
        setNeprebrano(n)
      } catch {
        /* tiho */
      }
    }
    preveri()
    const t = setInterval(preveri, 15000)
    // Osveži tudi, ko se uporabnik vrne na zavihek ali ko stran klepeta posodobi prebrano.
    const naFokus = () => preveri()
    const naShrambo = (e: StorageEvent) => {
      if (e.key === BRANJE_KEY) preveri()
    }
    window.addEventListener('focus', naFokus)
    window.addEventListener('storage', naShrambo)
    return () => {
      zivo = false
      clearInterval(t)
      window.removeEventListener('focus', naFokus)
      window.removeEventListener('storage', naShrambo)
    }
  }, [])

  return (
    <Link
      href="/interno/klepet"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 8,
        background: '#00bbc1',
        color: '#fff',
        fontWeight: 600,
        fontSize: 13,
        textDecoration: 'none',
      }}
    >
      <span aria-hidden>💬</span>
      <span style={{ flex: 1 }}>Klepet ekipe</span>
      {neprebrano > 0 && (
        <span
          style={{
            background: '#fff',
            color: '#00807f',
            borderRadius: 999,
            padding: '0 7px',
            minWidth: 20,
            height: 20,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {neprebrano}
        </span>
      )}
    </Link>
  )
}
