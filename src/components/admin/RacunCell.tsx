'use client'

import React from 'react'

// Stolpec v seznamu uporabnikov: ali je uporabnik aktiviral račun (se je že prijavil).
// Temelji na polju »zadnjaPrijava« – če je nastavljeno, je račun aktiviran.
export const RacunCell = (props: { cellData?: unknown }) => {
  const aktiviran = Boolean(props.cellData)
  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: 999,
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 700,
        background: aktiviran ? '#e8f8ee' : '#fff4e5',
        color: aktiviran ? '#157a43' : '#b8860b',
      }}
    >
      {aktiviran ? '✓ Aktiviran' : 'Ni aktiviran'}
    </span>
  )
}
