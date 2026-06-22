'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { Honeypot } from '@/components/forms/Honeypot'

export type Field = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'textarea'
  required?: boolean
  full?: boolean
}

export default function SimpleForm({
  action,
  fields,
  hidden,
  submitLabel = 'Pošlji',
  gdprLabel = 'Soglašam z obdelavo osebnih podatkov.',
  successTitle = 'Hvala!',
  successText = 'Sporočilo je bilo poslano.',
}: {
  action: string
  fields: Field[]
  hidden?: Record<string, string>
  submitLabel?: string
  gdprLabel?: string
  successTitle?: string
  successText?: string
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setMessage('')
    try {
      const res = await fetch(action, { method: 'POST', body: new FormData(e.currentTarget) })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setStatus('error')
        setMessage(json.error || 'Prišlo je do napake.')
        return
      }
      setStatus('ok')
    } catch {
      setStatus('error')
      setMessage('Povezava ni uspela.')
    }
  }

  if (status === 'ok') {
    return (
      <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="h-12 w-12 text-teal" strokeWidth={1.6} />
        <h3 className="mt-3 text-lg font-bold text-navy">{successTitle}</h3>
        <p className="mt-1 text-sm text-muted">{successText}</p>
      </div>
    )
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20'

  return (
    <form onSubmit={onSubmit} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-card sm:p-8">
      <Honeypot />
      {hidden &&
        Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium text-navy" htmlFor={f.name}>
              {f.label} {f.required && '*'}
            </label>
            {f.type === 'textarea' ? (
              <textarea id={f.name} name={f.name} required={f.required} rows={4} className={inputCls} />
            ) : (
              <input id={f.name} name={f.name} type={f.type || 'text'} required={f.required} className={inputCls} />
            )}
          </div>
        ))}
      </div>

      <label className="mt-4 flex items-start gap-2.5 text-sm text-navy/90">
        <input type="checkbox" name="soglasjeGDPR" value="true" required className="mt-0.5 h-4 w-4 accent-[#00bbc1]" />
        <span>
          {gdprLabel}{' '}
          <a href="/zasebnost" className="text-teal-700 underline">
            Politika zasebnosti
          </a>
        </span>
      </label>

      {status === 'error' && message && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
      >
        {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={2} />}
        {submitLabel}
      </button>
    </form>
  )
}
