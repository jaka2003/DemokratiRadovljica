'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, MessageCircle, Link2, Check } from 'lucide-react'

// Gumbi za deljenje objave. Uporabi trenutni naslov strani (URL) in podan naslov + hashtage.
export function ShareButtons({ title, hashtags = '' }: { title: string; hashtags?: string }) {
  const [copied, setCopied] = useState(false)

  const url = () => (typeof window !== 'undefined' ? window.location.href : '')
  const tags = hashtags
    .split(/\s+/)
    .map((t) => t.replace(/^#/, ''))
    .filter(Boolean)
  const besedilo = hashtags ? `${title} ${hashtags}` : title

  const native = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: besedilo, url: url() })
      } catch {
        /* uporabnik je preklical */
      }
    } else {
      copy()
    }
  }
  const odpri = (u: string) => window.open(u, '_blank', 'noopener,noreferrer')
  const fb = () => odpri(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`)
  const x = () =>
    odpri(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url())}&text=${encodeURIComponent(title)}${
        tags.length ? `&hashtags=${tags.join(',')}` : ''
      }`,
    )
  const wa = () => odpri(`https://wa.me/?text=${encodeURIComponent(`${besedilo} ${url()}`)}`)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard ni na voljo */
    }
  }

  const btn =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy/80 transition-colors hover:border-teal hover:text-teal'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-navy">Deli:</span>
      <button type="button" onClick={native} aria-label="Deli" className={`${btn} border-teal/40 text-teal`}>
        <Share2 className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
      <button type="button" onClick={fb} aria-label="Deli na Facebooku" className={btn}>
        <Facebook className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
      <button type="button" onClick={x} aria-label="Deli na X (Twitter)" className={btn}>
        <Twitter className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
      <button type="button" onClick={wa} aria-label="Deli na WhatsApp" className={btn}>
        <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
      <button type="button" onClick={copy} aria-label="Kopiraj povezavo" className={btn}>
        {copied ? <Check className="h-[18px] w-[18px] text-teal" strokeWidth={2.5} /> : <Link2 className="h-[18px] w-[18px]" strokeWidth={2} />}
      </button>
      {copied && <span className="text-xs font-medium text-teal-700">Povezava kopirana</span>}
    </div>
  )
}
