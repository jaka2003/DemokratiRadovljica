'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, X, Send, ArrowRight } from 'lucide-react'

type BotOdg = {
  najden: boolean
  programska: { naslov: string; slug: string; opis: string }[]
  vprasanja: { vprasanje: string; odgovor: string }[]
}
type Sporocilo = { tip: 'user'; besedilo: string } | { tip: 'bot'; odg: BotOdg }

export function ProgramBot() {
  const [odprt, setOdprt] = useState(false)
  const [sporocila, setSporocila] = useState<Sporocilo[]>([])
  const [vnos, setVnos] = useState('')
  const [loading, setLoading] = useState(false)
  const [podrocja, setPodrocja] = useState<{ naslov: string; slug: string }[]>([])
  const [chipsNalozeni, setChipsNalozeni] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!odprt || chipsNalozeni) return
    setChipsNalozeni(true)
    fetch('/program-bot')
      .then((r) => r.json())
      .then((d) => d.ok && setPodrocja(d.podrocja))
      .catch(() => {})
  }, [odprt, chipsNalozeni])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [sporocila, loading])

  const vprasaj = async (q: string) => {
    const tekst = q.trim()
    if (!tekst || loading) return
    setSporocila((p) => [...p, { tip: 'user', besedilo: tekst }])
    setVnos('')
    setLoading(true)
    try {
      const r = await fetch('/program-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vprasanje: tekst }),
      })
      const d = await r.json()
      const odg: BotOdg = d.ok
        ? { najden: d.najden, programska: d.programska || [], vprasanja: d.vprasanja || [] }
        : { najden: false, programska: [], vprasanja: [] }
      setSporocila((p) => [...p, { tip: 'bot', odg }])
    } catch {
      setSporocila((p) => [...p, { tip: 'bot', odg: { najden: false, programska: [], vprasanja: [] } }])
    } finally {
      setLoading(false)
    }
  }

  if (!odprt) {
    return (
      <button
        type="button"
        onClick={() => setOdprt(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Vprašaj o programu"
      >
        <Bot className="h-5 w-5" strokeWidth={2} /> Vprašaj o programu
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[70vh] max-h-[560px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
      <div className="flex items-center justify-between gap-2 bg-navy px-4 py-3 text-white">
        <span className="flex items-center gap-2 font-bold">
          <Bot className="h-5 w-5 text-teal" strokeWidth={2} /> Programski robot
        </span>
        <button type="button" onClick={() => setOdprt(false)} aria-label="Zapri">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-cloud/30 p-3">
        <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-line bg-white px-3.5 py-2.5 text-sm text-navy">
          Živjo! 👋 Vprašaj me o našem programu — poiščem ti ustrezno področje. Npr. parkiranje, ceste, mladi, stanovanja.
        </div>

        {sporocila.length === 0 && podrocja.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {podrocja.slice(0, 6).map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => vprasaj(p.naslov)}
                className="rounded-full border border-teal/40 bg-white px-2.5 py-1 text-xs font-medium text-teal-700 transition-colors hover:bg-teal/10"
              >
                {p.naslov}
              </button>
            ))}
          </div>
        )}

        {sporocila.map((m, i) =>
          m.tip === 'user' ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-teal px-3.5 py-2 text-sm font-medium text-white">
              {m.besedilo}
            </div>
          ) : (
            <BotOdgovor key={i} odg={m.odg} />
          ),
        )}

        {loading && (
          <div className="max-w-[60%] rounded-2xl rounded-tl-md border border-line bg-white px-3.5 py-2.5 text-sm text-muted">
            Iščem v programu …
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          vprasaj(vnos)
        }}
        className="flex items-center gap-2 border-t border-line p-2.5"
      >
        <input
          value={vnos}
          onChange={(e) => setVnos(e.target.value)}
          maxLength={300}
          placeholder="Vprašaj o programu …"
          className="flex-1 rounded-full border border-line px-3.5 py-2 text-sm text-navy outline-none focus:border-teal"
        />
        <button
          type="submit"
          disabled={loading || !vnos.trim()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-white transition-opacity disabled:opacity-40"
          aria-label="Pošlji"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

function BotOdgovor({ odg }: { odg: BotOdg }) {
  if (!odg.najden) {
    return (
      <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-line bg-white px-3.5 py-2.5 text-sm text-navy">
        Tega nisem našel v programu. 🤔 Lahko pogledaš{' '}
        <a href="/program" className="font-semibold text-teal-700 underline">
          cel program
        </a>{' '}
        ali{' '}
        <a href="/vprasanja" className="font-semibold text-teal-700 underline">
          postaviš vprašanje ekipi
        </a>
        .
      </div>
    )
  }
  return (
    <div className="max-w-[92%] space-y-2">
      <div className="rounded-2xl rounded-tl-md border border-line bg-white px-3.5 py-2 text-sm text-navy">Iz našega programa:</div>
      {odg.programska.map((p) => (
        <a
          key={p.slug}
          href={`/program/${p.slug}`}
          className="block rounded-xl border border-line bg-white p-3 transition-colors hover:border-teal"
        >
          <span className="flex items-center gap-1 text-sm font-bold text-navy">
            {p.naslov} <ArrowRight className="h-3.5 w-3.5 text-teal" />
          </span>
          {p.opis && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{p.opis}</span>}
        </a>
      ))}
      {odg.vprasanja.map((v, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-3">
          <span className="block text-sm font-semibold text-navy">{v.vprasanje}</span>
          <span className="mt-1 block whitespace-pre-line text-xs leading-relaxed text-navy/80">{v.odgovor}</span>
        </div>
      ))}
    </div>
  )
}
