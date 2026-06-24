'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, MessageSquarePlus, Search, Send, Trash2, Users, X } from 'lucide-react'
import { kljucDm, kljucSobe, nalozjBranje, shraniBranje } from './branje'

type Jaz = { id: number; ime: string }
type SobaInfo = {
  kljuc: string
  naziv: string
  ikona: string
  opis: string
  zadnjiId: number
  zadnjeBesedilo: string
  zadnjiCas: string
  zadnjiAvtor: string
}
type PogovorInfo = {
  uporabnikId: number
  ime: string
  zadnjiId: number
  zadnjeBesedilo: string
  zadnjiCas: string
  odMene: boolean
}
type UporabnikInfo = { id: number; ime: string; vloge: string[] }
type Pregled = { ok: boolean; admin: boolean; sobe: SobaInfo[]; pogovori: PogovorInfo[]; uporabniki: UporabnikInfo[] }
type Sporocilo = { id: number; besedilo: string; avtorId: number; avtorIme: string; cas: string; jaz: boolean }
type Aktivno =
  | { tip: 'soba'; kljuc: string; naziv: string; ikona: string }
  | { tip: 'dm'; uporabnikId: number; naziv: string }
  | null

const BARVE = ['#00bbc1', '#0f004e', '#157a43', '#b45309', '#7c3aed', '#be185d', '#0369a1', '#0d9488']
const barvaZa = (id: number) => BARVE[Math.abs(Math.trunc(id)) % BARVE.length]
const inicialke = (ime: string) =>
  ime
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('') || '?'

const casNaprej = (iso: string): string => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const istiDan = d.toDateString() === new Date().toDateString()
    return d.toLocaleString(
      'sl-SI',
      istiDan
        ? { hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' },
    )
  } catch {
    return ''
  }
}

const trenutniKljuc = (a: NonNullable<Aktivno>): string =>
  a.tip === 'soba' ? kljucSobe(a.kljuc) : kljucDm(a.uporabnikId)

export function Klepet({ jaz, admin }: { jaz: Jaz; admin: boolean }) {
  const [pregled, setPregled] = useState<Pregled | null>(null)
  const [aktivno, setAktivno] = useState<Aktivno>(null)
  const [sporocila, setSporocila] = useState<Sporocilo[]>([])
  const [vnos, setVnos] = useState('')
  const [posiljam, setPosiljam] = useState(false)
  const [napaka, setNapaka] = useState('')
  const [mobilniPogled, setMobilniPogled] = useState<'seznam' | 'pogovor'>('seznam')
  const [branje, setBranje] = useState<Record<string, number>>({})
  const [novPogovor, setNovPogovor] = useState(false)
  const [iskanje, setIskanje] = useState('')

  const skrollRef = useRef<HTMLDivElement>(null)
  const naDnuRef = useRef(true)
  const aktivenK = aktivno ? trenutniKljuc(aktivno) : ''

  const oznaciPrebrano = (k: string, id: number) => {
    setBranje((prev) => {
      if ((prev[k] || 0) >= id) return prev
      const novo = { ...prev, [k]: id }
      shraniBranje(novo)
      return novo
    })
  }

  // Stranska vrstica (sobe, pogovori, uporabniki) – osveževanje na 6 s.
  useEffect(() => {
    setBranje(nalozjBranje())
    const nalozi = async () => {
      try {
        const r = await fetch('/interno/klepet/pregled', { credentials: 'include' })
        const d = await r.json()
        if (d.ok) setPregled(d)
      } catch {
        /* tiho */
      }
    }
    nalozi()
    const t = setInterval(nalozi, 6000)
    return () => clearInterval(t)
  }, [])

  // Sporočila aktivnega kanala – osveževanje na 3 s.
  useEffect(() => {
    if (!aktivno) {
      setSporocila([])
      return
    }
    let veljaven = true
    const qs = aktivno.tip === 'soba' ? `soba=${encodeURIComponent(aktivno.kljuc)}` : `pogovor=${aktivno.uporabnikId}`
    const kljuc = trenutniKljuc(aktivno)
    const nalozi = async () => {
      try {
        const r = await fetch(`/interno/klepet/sporocila?${qs}`, { credentials: 'include' })
        const d = await r.json()
        if (!veljaven) return
        if (d.ok) {
          setSporocila(d.sporocila as Sporocilo[])
          const maxId = (d.sporocila as Sporocilo[]).reduce((m, s) => Math.max(m, s.id), 0)
          if (maxId > 0) oznaciPrebrano(kljuc, maxId)
        } else {
          setNapaka(d.error || '')
        }
      } catch {
        /* tiho */
      }
    }
    setSporocila([])
    setNapaka('')
    naDnuRef.current = true
    nalozi()
    const t = setInterval(nalozi, 3000)
    return () => {
      veljaven = false
      clearInterval(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktivno])

  // Samodejni pomik na dno ob novih sporočilih (če smo že na dnu).
  useEffect(() => {
    const el = skrollRef.current
    if (el && naDnuRef.current) el.scrollTop = el.scrollHeight
  }, [sporocila])

  const ohraniDno = () => {
    const el = skrollRef.current
    if (!el) return
    naDnuRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  const izberiSobo = (s: SobaInfo) => {
    setAktivno({ tip: 'soba', kljuc: s.kljuc, naziv: s.naziv, ikona: s.ikona })
    setMobilniPogled('pogovor')
    setNovPogovor(false)
  }
  const izberiDm = (uporabnikId: number, ime: string) => {
    setAktivno({ tip: 'dm', uporabnikId, naziv: ime })
    setMobilniPogled('pogovor')
    setNovPogovor(false)
    setIskanje('')
  }

  const poslji = async () => {
    const tekst = vnos.trim()
    if (!tekst || !aktivno || posiljam) return
    setPosiljam(true)
    setNapaka('')
    const body =
      aktivno.tip === 'soba'
        ? { soba: aktivno.kljuc, besedilo: tekst }
        : { prejemnik: aktivno.uporabnikId, besedilo: tekst }
    try {
      const r = await fetch('/interno/klepet/poslji', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (d.ok) {
        setVnos('')
        naDnuRef.current = true
        const novo = d.sporocilo as Sporocilo
        setSporocila((prev) => (prev.some((s) => s.id === novo.id) ? prev : [...prev, novo]))
        oznaciPrebrano(trenutniKljuc(aktivno), novo.id)
      } else {
        setNapaka(d.error || 'Sporočila ni bilo mogoče poslati.')
      }
    } catch {
      setNapaka('Povezava ni uspela.')
    } finally {
      setPosiljam(false)
    }
  }

  const izbrisi = async (id: number) => {
    if (!window.confirm('Izbrišem to sporočilo?')) return
    try {
      const r = await fetch('/interno/klepet/izbrisi', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await r.json()
      if (d.ok) setSporocila((prev) => prev.filter((s) => s.id !== id))
      else setNapaka(d.error || 'Brisanje ni uspelo.')
    } catch {
      setNapaka('Povezava ni uspela.')
    }
  }

  const neprebrano = (k: string, zadnjiId: number, odMene = false) =>
    !odMene && zadnjiId > 0 && zadnjiId > (branje[k] || 0) && k !== aktivenK

  const filtriraniUporabniki = (pregled?.uporabniki || []).filter((u) =>
    u.ime.toLowerCase().includes(iskanje.trim().toLowerCase()),
  )

  // ─── Stranska vrstica ────────────────────────────────────────────────────
  const stranskaVrstica = (
    <aside
      className={`${
        mobilniPogled === 'pogovor' ? 'hidden md:flex' : 'flex'
      } min-h-0 flex-col border-line bg-cloud/40 md:border-r`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <span className="text-sm font-bold text-navy">Klepet ekipe</span>
        <button
          type="button"
          onClick={() => {
            setNovPogovor((v) => !v)
            setIskanje('')
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          {novPogovor ? <X className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}
          {novPogovor ? 'Zapri' : 'Novo'}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {!pregled && <p className="px-2 text-sm text-muted">Nalagam …</p>}

        {/* Izbirnik za nov zasebni pogovor */}
        {novPogovor && pregled && (
          <div className="mb-3 rounded-xl border border-line bg-white p-2">
            <div className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={iskanje}
                onChange={(e) => setIskanje(e.target.value)}
                placeholder="Poišči osebo …"
                className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-muted"
                autoFocus
              />
            </div>
            <div className="mt-2 max-h-56 overflow-y-auto">
              {filtriraniUporabniki.length === 0 ? (
                <p className="px-2 py-2 text-xs text-muted">Ni zadetkov.</p>
              ) : (
                filtriraniUporabniki.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => izberiDm(u.id, u.ime)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-cloud"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: barvaZa(u.id) }}
                    >
                      {inicialke(u.ime)}
                    </span>
                    <span className="truncate text-sm font-medium text-navy">{u.ime}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sobe */}
        <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">Sobe</p>
        <div className="space-y-0.5">
          {(pregled?.sobe || []).map((s) => {
            const k = kljucSobe(s.kljuc)
            const aktiven = aktivno?.tip === 'soba' && aktivno.kljuc === s.kljuc
            const nepr = neprebrano(k, s.zadnjiId)
            return (
              <button
                key={s.kljuc}
                type="button"
                onClick={() => izberiSobo(s)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                  aktiven ? 'bg-teal/15' : 'hover:bg-cloud'
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base shadow-sm">
                  {s.ikona}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`truncate text-sm ${nepr ? 'font-extrabold text-navy' : 'font-semibold text-navy'}`}>
                      {s.naziv}
                    </span>
                    {nepr && <span className="h-2 w-2 shrink-0 rounded-full bg-teal" />}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {s.zadnjeBesedilo ? `${s.zadnjiAvtor}: ${s.zadnjeBesedilo}` : s.opis}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Zasebni pogovori */}
        {(pregled?.pogovori || []).length > 0 && (
          <>
            <p className="px-2 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wide text-muted">Zasebno</p>
            <div className="space-y-0.5">
              {(pregled?.pogovori || []).map((p) => {
                const k = kljucDm(p.uporabnikId)
                const aktiven = aktivno?.tip === 'dm' && aktivno.uporabnikId === p.uporabnikId
                const nepr = neprebrano(k, p.zadnjiId, p.odMene)
                return (
                  <button
                    key={p.uporabnikId}
                    type="button"
                    onClick={() => izberiDm(p.uporabnikId, p.ime)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                      aktiven ? 'bg-teal/15' : 'hover:bg-cloud'
                    }`}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: barvaZa(p.uporabnikId) }}
                    >
                      {inicialke(p.ime)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`truncate text-sm ${nepr ? 'font-extrabold text-navy' : 'font-semibold text-navy'}`}>
                          {p.ime}
                        </span>
                        {nepr && <span className="h-2 w-2 shrink-0 rounded-full bg-teal" />}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {p.odMene ? 'Vi: ' : ''}
                        {p.zadnjeBesedilo}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </aside>
  )

  // ─── Pogovorno okno ──────────────────────────────────────────────────────
  const pogovornoOkno = (
    <div className={`${mobilniPogled === 'seznam' ? 'hidden md:flex' : 'flex'} min-h-0 flex-col`}>
      {/* Glava */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button
          type="button"
          onClick={() => setMobilniPogled('seznam')}
          className="text-muted transition-colors hover:text-navy md:hidden"
          aria-label="Nazaj na seznam"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {aktivno ? (
          <div className="flex min-w-0 items-center gap-2.5">
            {aktivno.tip === 'soba' ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cloud text-base">
                {aktivno.ikona}
              </span>
            ) : (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: barvaZa(aktivno.uporabnikId) }}
              >
                {inicialke(aktivno.naziv)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">{aktivno.naziv}</p>
              <p className="text-xs text-muted">{aktivno.tip === 'soba' ? 'Soba' : 'Zasebni pogovor'}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm font-bold text-navy">Klepet</span>
        )}
      </div>

      {/* Sporočila */}
      <div ref={skrollRef} onScroll={ohraniDno} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-cloud/30 px-4 py-4">
        {!aktivno ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted">
            <Users className="mb-3 h-10 w-10 text-teal/60" strokeWidth={1.6} />
            <p className="text-sm font-medium">Izberi sobo ali zasebni pogovor.</p>
            <p className="mt-1 text-xs">Za novo zasebno sporočilo klikni »Novo« zgoraj levo.</p>
          </div>
        ) : sporocila.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted">
            Še ni sporočil. Začnite pogovor 👋
          </div>
        ) : (
          sporocila.map((m) => {
            const moje = m.jaz
            return (
              <div key={m.id} className={`group flex gap-2 ${moje ? 'flex-row-reverse' : 'flex-row'}`}>
                {!moje && (
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: barvaZa(m.avtorId) }}
                  >
                    {inicialke(m.avtorIme)}
                  </span>
                )}
                <div className={`max-w-[80%] ${moje ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!moje && <span className="mb-0.5 px-1 text-xs font-semibold text-navy/70">{m.avtorIme}</span>}
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      moje ? 'rounded-br-md bg-teal text-white' : 'rounded-bl-md border border-line bg-white text-navy'
                    }`}
                  >
                    {m.besedilo}
                  </div>
                  <div className={`mt-0.5 flex items-center gap-2 px-1 text-[11px] text-muted ${moje ? 'flex-row-reverse' : ''}`}>
                    <span>{casNaprej(m.cas)}</span>
                    {(moje || admin) && (
                      <button
                        type="button"
                        onClick={() => izbrisi(m.id)}
                        className="inline-flex items-center gap-0.5 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                        title="Izbriši sporočilo"
                      >
                        <Trash2 className="h-3 w-3" /> Izbriši
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Vnos */}
      <div className="border-t border-line p-3">
        {napaka && (
          <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{napaka}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={vnos}
            onChange={(e) => setVnos(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                poslji()
              }
            }}
            disabled={!aktivno}
            rows={1}
            placeholder={aktivno ? 'Napiši sporočilo … (Enter pošlje, Shift+Enter nova vrstica)' : 'Najprej izberi pogovor …'}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal disabled:bg-cloud/50"
          />
          <button
            type="button"
            onClick={poslji}
            disabled={posiljam || !vnos.trim() || !aktivno}
            className="inline-flex h-[44px] items-center gap-1.5 rounded-xl bg-teal px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" /> Pošlji
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cloud text-2xl">💬</span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Klepet ekipe</h1>
          <p className="text-sm text-muted">Sobe po skupinah in zasebna sporočila med člani ekipe.</p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-card md:grid-cols-[280px_1fr]"
        style={{ height: '72vh', minHeight: 480 }}
      >
        {stranskaVrstica}
        {pogovornoOkno}
      </div>
    </div>
  )
}
