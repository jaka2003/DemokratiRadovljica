'use client'

import React from 'react'

// Lepši prikaz logične vrednosti (checkbox) v seznamih – »Da« / »Ne« namesto true/false.
export const DaNeCell = (props: { cellData?: unknown }) => {
  const da = Boolean(props?.cellData)
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 9px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: da ? '#e8f8ee' : '#f1f2f6',
        color: da ? '#157a43' : '#5b5f73',
      }}
    >
      {da ? 'Da' : 'Ne'}
    </span>
  )
}
