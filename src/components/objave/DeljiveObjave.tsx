'use client'

import { useState } from 'react'
import { Copy, Download, Check, Facebook, FileText } from 'lucide-react'

export type Objava = {
  id: string | number
  naslov: string
  platforma: string
  besedilo: string
  besediloKratko: string
  slikaUrl: string
  slikaIme: string
  povezava: string
  hashtagi: string
}

const PLATFORMA: Record<string, string> = {
  splosno: 'Splošno',
  facebook: 'Facebook',
  instagram: 'Instagram',
  story: 'Zgodba',
}

export function DeljiveObjave({ objave }: { objave: Objava[] }) {
  const [kopirano, setKopirano] = useState<string>('')

  const kopiraj = async (kljuc: string, besedilo: string, hashtagi: string) => {
    const tekst = hashtagi ? `${besedilo}\n\n${hashtagi}` : besedilo
    try {
      await navigator.clipboard.writeText(tekst)
      setKopirano(kljuc)
      setTimeout(() => setKopirano(''), 1800)
    } catch {
      /* brez clipboard dovoljenja – tiho */
    }
  }

  const odpriFb = (povezava: string) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(povezava)}`, '_blank', 'noopener')
  }

  const gumb = 'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-opacity hover:opacity-90'

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {objave.map((o) => (
        <article key={String(o.id)} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card">
          {o.slikaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={o.slikaUrl} alt={o.naslov} className="h-48 w-full object-cover" />
          ) : (
            <div className="flex h-24 w-full items-center justify-center bg-cloud text-muted">
              <FileText className="h-7 w-7" strokeWidth={1.5} />
            </div>
          )}

          <div className="flex flex-1 flex-col p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                {PLATFORMA[o.platforma] || 'Splošno'}
              </span>
              <span className="truncate text-xs font-semibold text-muted">{o.naslov}</span>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-navy/90">{o.besedilo}</p>
            {o.hashtagi && <p className="mt-2 text-sm font-medium text-teal-700">{o.hashtagi}</p>}

            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => kopiraj(`d-${o.id}`, o.besedilo, o.hashtagi)}
                className={`${gumb} bg-navy text-white`}
              >
                {kopirano === `d-${o.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {kopirano === `d-${o.id}` ? 'Kopirano!' : 'Kopiraj besedilo'}
              </button>

              {o.besediloKratko && (
                <button
                  type="button"
                  onClick={() => kopiraj(`k-${o.id}`, o.besediloKratko, o.hashtagi)}
                  className={`${gumb} bg-cloud text-navy`}
                >
                  {kopirano === `k-${o.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {kopirano === `k-${o.id}` ? 'Kopirano!' : 'Kopiraj kratko'}
                </button>
              )}

              {o.slikaUrl && (
                <a href={o.slikaUrl} download={o.slikaIme || 'objava.jpg'} className={`${gumb} bg-cloud text-navy`}>
                  <Download className="h-3.5 w-3.5" /> Prenesi sliko
                </a>
              )}

              <button type="button" onClick={() => odpriFb(o.povezava)} className={`${gumb} bg-[#1877f2] text-white`}>
                <Facebook className="h-3.5 w-3.5" /> Odpri Facebook
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">Na Facebooku besedilo prilepiš (Ctrl+V), sliko pa pripneš.</p>
          </div>
        </article>
      ))}
    </div>
  )
}
