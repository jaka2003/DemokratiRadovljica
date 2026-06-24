'use client'

import { Printer } from 'lucide-react'

// Gumb za tiskanje / shranjevanje poročila kot PDF (prek brskalnika).
export function NatisniGumb() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
    >
      <Printer className="h-4 w-4" strokeWidth={2} /> Natisni / shrani PDF
    </button>
  )
}
