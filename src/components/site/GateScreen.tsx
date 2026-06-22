'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lock, Loader2, ArrowRight } from 'lucide-react'

// Vstopni zaslon, ko je javna stran zaklenjena. Vnos pravilnega gesla odklene ogled.
export function GateScreen({ naslov, besedilo }: { naslov: string; besedilo: string }) {
  const [geslo, setGeslo] = useState('')
  const [napaka, setNapaka] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setNapaka('')
    try {
      const res = await fetch('/odkleni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geslo }),
      })
      const json = await res.json()
      if (json.ok) {
        window.location.href = '/'
      } else {
        setNapaka(json.error || 'Napačno geslo.')
        setLoading(false)
      }
    } catch {
      setNapaka('Povezava ni uspela. Poskusi znova.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-navy via-navy-700 to-teal-700 px-5 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-8 text-center shadow-2xl sm:p-10">
        <Image src="/logo-demokrati.svg" alt="Demokrati Radovljica" width={200} height={42} className="mx-auto h-10 w-auto" priority />

        <div className="mx-auto mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
          <Lock className="h-5 w-5" strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-navy">{naslov}</h1>
        {besedilo && <p className="mt-3 text-sm leading-relaxed text-muted">{besedilo}</p>}

        <form onSubmit={submit} className="mt-7">
          <input
            type="password"
            value={geslo}
            onChange={(e) => setGeslo(e.target.value)}
            placeholder="Vnesi geslo"
            autoFocus
            className="w-full rounded-lg border border-line bg-white px-4 py-3 text-center text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
          {napaka && <p className="mt-2 text-sm font-medium text-red-600">{napaka}</p>}
          <button
            type="submit"
            disabled={loading || !geslo}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" strokeWidth={2} />}
            {loading ? 'Preverjam …' : 'Vstopi'}
          </button>
        </form>
      </div>
    </div>
  )
}
