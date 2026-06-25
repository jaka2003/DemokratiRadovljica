'use client'

import { useEffect, useRef, useState } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

// Ko v urejevalniku svetnika izbereš uporabnika, samodejno napolni prazna besedilna polja
// (ime in priimek, kraj, poklic, opis, predstavitev, e-naslov) iz njegovega profila.
export const SvetnikAutofill = () => {
  const [fields, dispatchFields] = useAllFormFields()
  const f = fields as Record<string, { value?: unknown }>
  const raw = f.uporabnik?.value
  const id = raw && typeof raw === 'object' ? (raw as { value?: unknown }).value : raw
  const zadnji = useRef<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!id) return
    if (zadnji.current === String(id)) return
    zadnji.current = String(id)

    const napolniPrazno = (path: string, value: unknown) => {
      if (value == null || value === '') return
      const trenutno = f[path]?.value
      if (trenutno == null || trenutno === '') dispatchFields({ type: 'UPDATE', path, value })
    }

    ;(async () => {
      try {
        const r = await fetch(`/interno/svetnik-prefill?id=${id}`, { credentials: 'include' })
        const d = await r.json()
        if (!d.ok) return
        napolniPrazno('imePriimek', d.podatki.imePriimek)
        napolniPrazno('kraj', d.podatki.kraj)
        napolniPrazno('poklic', d.podatki.poklic)
        napolniPrazno('kratekOpis', d.podatki.kratekOpis)
        napolniPrazno('predstavitev', d.podatki.predstavitev)
        napolniPrazno('email', d.podatki.email)
        setMsg('Podatki prenešeni iz izbranega uporabnika. Preglej in po potrebi uredi.')
      } catch {
        /* tiho */
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return msg ? <p style={{ margin: '6px 0 0', fontSize: 12, color: '#008288' }}>✓ {msg}</p> : null
}
