'use client'

import { useState } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

// Gumb v profilu kandidata: pošlje vnose v AI končno točko in napolni polja predstavitev.
export const AiGenerator = () => {
  const [fields, dispatchFields] = useAllFormFields()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const getVal = (path: string) => String((fields as Record<string, { value?: unknown }>)[path]?.value ?? '')
  const setField = (path: string, value: string) => dispatchFields({ type: 'UPDATE', path, value })

  const generate = async () => {
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const res = await fetch('/interno/ai-predlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          poklic: getVal('aiPoklic'),
          izkusnje: getVal('aiIzkusnje'),
          podrocja: getVal('aiPodrocja'),
          lokalneTeme: getVal('aiLokalneTeme'),
          razlog: getVal('aiRazlog'),
          kraj: getVal('naslovKraj'),
          vrednote: getVal('aiVrednote'),
          sporocila: getVal('aiSporocila'),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setError(json.error || 'Napaka pri pripravi predlogov.')
        return
      }
      const d = json.drafts
      setField('opis', d.kratkaPredstavitev ?? '')
      setField('podrocjaSodelovanja', d.podrocjaSodelovanja ?? '')
      setField('politicnaPredstavitev', d.politicnaPredstavitev ?? '')
      setDone(true)
    } catch {
      setError('Povezava ni uspela. Poskusi znova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #e7e9f1', borderRadius: 8 }}>
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="btn btn--style-primary btn--size-small"
      >
        {loading ? 'Pripravljam predloge …' : '✨ Generiraj predloge z AI'}
      </button>
      {done && (
        <span style={{ marginLeft: 12, color: '#008288' }}>
          Izpolnjeno! Zapri ta razdelek in preglej polja »Kratka predstavitev«, »Področja sodelovanja«
          in »Kratka politična predstavitev« spodaj.
        </span>
      )}
      {error && <p style={{ marginTop: 8, color: '#b00020' }}>{error}</p>}
      <p style={{ marginTop: 8, fontSize: 12, color: '#5b5f73' }}>
        Predloge pripravi umetna inteligenca na podlagi zgornjih vnosov. Vedno jih pred objavo preglej in uredi.
      </p>
    </div>
  )
}
