'use client'

import { useState } from 'react'
import { Check, ThumbsUp, ThumbsDown, MinusCircle, FileText } from 'lucide-react'

type Priloga = { url: string; filename: string }
type Tocka = { id: string; naslov: string; opis?: string; gradivo?: string; priloge: Priloga[]; dodatni: Priloga[] }

const OPCIJE = [
  { v: 'za', l: 'ZA', c: '#157a43', bg: '#e8f8ee', Icon: ThumbsUp },
  { v: 'proti', l: 'PROTI', c: '#b00020', bg: '#fdecee', Icon: ThumbsDown },
  { v: 'vzdrzan', l: 'VZDRŽAN', c: '#5b5f73', bg: '#f1f2f6', Icon: MinusCircle },
]

export function GlasovanjeTocke({
  sejaId,
  tocke,
  zeGlasovano,
  odprto,
}: {
  sejaId: string | number
  tocke: Tocka[]
  zeGlasovano: Record<string, string>
  odprto: boolean
}) {
  const [glasovi, setGlasovi] = useState<Record<string, string>>(zeGlasovano)
  const [busy, setBusy] = useState('')
  const [napaka, setNapaka] = useState('')

  const glasuj = async (tockaId: string, glas: string) => {
    setBusy(tockaId)
    setNapaka('')
    try {
      const res = await fetch('/interno/seje/glasuj', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sejaId, tockaId, glas }),
      })
      const json = await res.json()
      if (json.ok) {
        setGlasovi((p) => ({ ...p, [tockaId]: glas }))
        if (json.status === 'zakljucena') setTimeout(() => window.location.reload(), 900)
      } else {
        setNapaka(json.error || 'Napaka pri glasovanju.')
      }
    } catch {
      setNapaka('Povezava ni uspela. Poskusite znova.')
    } finally {
      setBusy('')
    }
  }

  const stevilo = tocke.length
  const oddanih = tocke.filter((t) => glasovi[t.id]).length

  return (
    <div className="space-y-5">
      {odprto && (
        <p className="text-sm text-muted">
          Oddanih glasov: <strong className="text-navy">{oddanih}</strong> od {stevilo}.
        </p>
      )}
      {napaka && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{napaka}</p>}

      {tocke.map((t, i) => {
        const moj = glasovi[t.id]
        const prilEnotno = [...t.priloge, ...t.dodatni]
        return (
          <div key={t.id} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold text-navy">{t.naslov}</h3>
            </div>
            {t.opis && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy/85">{t.opis}</p>}
            {t.gradivo && <p className="mt-2 whitespace-pre-line text-sm text-muted">{t.gradivo}</p>}

            {prilEnotno.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {prilEnotno.map((p, j) => (
                  <a
                    key={j}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-cloud px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-teal"
                  >
                    <FileText className="h-3.5 w-3.5 text-teal" strokeWidth={2} /> {p.filename}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-line pt-4">
              {moj ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal-700">
                  <Check className="h-4 w-4" strokeWidth={2.5} /> Glasovali ste:{' '}
                  {OPCIJE.find((o) => o.v === moj)?.l}
                </div>
              ) : odprto ? (
                <div className="flex flex-wrap gap-2">
                  {OPCIJE.map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      disabled={busy === t.id}
                      onClick={() => glasuj(t.id, o.v)}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-opacity disabled:opacity-50"
                      style={{ background: o.bg, color: o.c, border: `1px solid ${o.c}33` }}
                    >
                      <o.Icon className="h-4 w-4" strokeWidth={2.2} /> {o.l}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Glasovanje za to sejo trenutno ni odprto.</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
