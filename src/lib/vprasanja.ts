// Konstante za modul »Vprašanja občanov« (javni Q&A).

export const VPRASANJE_STATUSI = [
  { value: 'novo', label: 'Novo' },
  { value: 'v_obravnavi', label: 'V obravnavi' },
  { value: 'odgovorjeno', label: 'Odgovorjeno' },
  { value: 'zavrnjeno', label: 'Neprimerno / zavrnjeno' },
] as const

export function vprasanjeStatusLabel(v: unknown): string {
  return VPRASANJE_STATUSI.find((s) => s.value === v)?.label || 'Novo'
}

// Javna oznaka avtorja vprašanja (anonimizirano, če ne dovoli objave imena).
export const ANONIMNI_AVTOR = 'Občan/-ka'
