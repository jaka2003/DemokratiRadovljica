'use client'

import { useState } from 'react'
import { Users, Send, CheckCircle2 } from 'lucide-react'
import { VLOGE } from '@/access/roles'

type Oseba = { id: string | number; ime: string; email: string; vloga: string[] }

export function DodeliNaloge() {
  const [kategorije, setKategorije] = useState<string[]>([])
  const [osebe, setOsebe] = useState<Oseba[] | null>(null)
  const [izbrani, setIzbrani] = useState<Set<string | number>>(new Set())
  const [nalagam, setNalagam] = useState(false)

  const [naslov, setNaslov] = useState('')
  const [opis, setOpis] = useState('')
  const [rok, setRok] = useState('')
  const [posiljam, setPosiljam] = useState(false)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)

  const toggleKat = (v: string) => {
    setKategorije((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))
    setOsebe(null)
    setIzbrani(new Set())
  }

  const prikaziOsebe = async () => {
    setNalagam(true)
    setMsg('')
    try {
      const r = await fetch('/interno/prejemniki', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kategorije, nacin: 'katera' }),
      })
      const d = await r.json()
      if (d.ok) {
        setOsebe(d.users)
        setIzbrani(new Set((d.users as Oseba[]).map((u) => u.id)))
      } else setMsg(d.error || 'Napaka pri nalaganju oseb.')
    } catch {
      setMsg('Povezava ni uspela.')
    } finally {
      setNalagam(false)
    }
  }

  const toggleOseba = (id: string | number) =>
    setIzbrani((p) => {
      const n = new Set(p)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const dodeli = async () => {
    if (!naslov.trim()) {
      setOk(false)
      setMsg('Vnesi naslov naloge.')
      return
    }
    if (izbrani.size === 0) {
      setOk(false)
      setMsg('Izberi vsaj eno osebo.')
      return
    }
    setPosiljam(true)
    setMsg('')
    try {
      const r = await fetch('/interno/dodeli-naloge', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: [...izbrani], naslov, opis, rok: rok || undefined }),
      })
      const d = await r.json()
      if (d.ok) {
        setOk(true)
        setMsg(`✓ Naloga dodeljena ${d.count} ${d.count === 1 ? 'osebi' : 'osebam'} (poslana e-pošta).`)
        setNaslov('')
        setOpis('')
        setRok('')
      } else {
        setOk(false)
        setMsg(d.error || 'Dodeljevanje ni uspelo.')
      }
    } catch {
      setOk(false)
      setMsg('Povezava ni uspela.')
    } finally {
      setPosiljam(false)
    }
  }

  const oznaka = 'mb-2 block text-xs font-bold uppercase tracking-wide text-muted'
  const polje = 'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-teal'

  return (
    <div className="space-y-6">
      {/* 1) Vloge */}
      <div>
        <span className={oznaka}>1 · Koga (filtriraj po vlogi)</span>
        <div className="flex flex-wrap gap-2">
          {VLOGE.map((v) => {
            const on = kategorije.includes(v.value)
            return (
              <button
                key={v.value}
                type="button"
                onClick={() => toggleKat(v.value)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  on ? 'bg-teal text-white' : 'border border-line bg-white text-navy/80 hover:border-teal'
                }`}
              >
                {v.label}
              </button>
            )
          })}
        </div>
        <p className="mt-1.5 text-xs text-muted">Brez izbire = vsi uporabniki. Izbrane vloge = kdorkoli iz teh vlog.</p>
        <button
          type="button"
          onClick={prikaziOsebe}
          disabled={nalagam}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-teal disabled:opacity-50"
        >
          <Users className="h-4 w-4 text-teal" /> {nalagam ? 'Nalagam …' : osebe ? 'Osveži osebe' : 'Prikaži osebe'}
        </button>
      </div>

      {/* 2) Izbira oseb */}
      {osebe && (
        <div>
          <span className={oznaka}>
            2 · Izberi osebe ({izbrani.size} od {osebe.length})
          </span>
          {osebe.length === 0 ? (
            <p className="text-sm text-muted">Za izbrane vloge ni oseb z e-naslovom.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-xl border border-line">
              {osebe.map((u) => (
                <label
                  key={String(u.id)}
                  className="flex cursor-pointer items-center gap-3 border-b border-line/70 px-3 py-2 text-sm last:border-0 hover:bg-cloud/40"
                >
                  <input type="checkbox" checked={izbrani.has(u.id)} onChange={() => toggleOseba(u.id)} className="h-4 w-4 accent-teal" />
                  <span className="font-medium text-navy">{u.ime}</span>
                  <span className="ml-auto text-xs text-muted">{u.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3) Naloga */}
      <div>
        <span className={oznaka}>3 · Naloga</span>
        <input value={naslov} onChange={(e) => setNaslov(e.target.value)} placeholder="Naslov naloge (npr. »Razdeli letake v Lescah«)" className={`${polje} mb-3`} />
        <textarea value={opis} onChange={(e) => setOpis(e.target.value)} placeholder="Opis (neobvezno)" rows={3} className={`${polje} mb-3 resize-y`} />
        <label className="mb-1.5 block text-sm font-medium text-navy">Rok (neobvezno)</label>
        <input type="date" value={rok} onChange={(e) => setRok(e.target.value)} className={`${polje} max-w-xs`} />
      </div>

      {msg && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {ok && <CheckCircle2 className="h-4 w-4" />} {msg}
        </div>
      )}

      <button
        type="button"
        onClick={dodeli}
        disabled={posiljam}
        className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-4 w-4" /> {posiljam ? 'Dodeljujem …' : `Dodeli nalogo izbranim (${izbrani.size})`}
      </button>
      <p className="text-xs text-muted">Vsaka izbrana oseba dobi svojo nalogo in obvestilo po e-pošti. Status spremeni sama, ko je opravljeno.</p>
    </div>
  )
}
