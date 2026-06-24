// Skupna logika za modul »Dopisne seje« (korespondenčno glasovanje).

export const SEJA_STATUSI = [
  { label: 'Osnutek', value: 'osnutek' },
  { label: 'Pripravljena za pošiljanje', value: 'pripravljena' },
  { label: 'V teku', value: 'v_teku' },
  { label: 'Zaključena', value: 'zakljucena' },
] as const

export const GLAS_OPCIJE = [
  { label: 'ZA', value: 'za' },
  { label: 'PROTI', value: 'proti' },
  { label: 'VZDRŽAN', value: 'vzdrzan' },
] as const

export type Glas = 'za' | 'proti' | 'vzdrzan'

export function statusLabel(v: unknown): string {
  return SEJA_STATUSI.find((s) => s.value === v)?.label || 'Osnutek'
}

export function glasLabel(v: unknown): string {
  return GLAS_OPCIJE.find((g) => g.value === v)?.label || String(v ?? '')
}

export type RezultatTocke = {
  za: number
  proti: number
  vzdrzan: number
  skupaj: number
  udelezba: number // odstotek
  sprejet: boolean
}

// Izračun rezultata za eno točko (navadna večina: ZA > PROTI → sprejet).
export function izracunajRezultat(
  glasovi: { glas: string }[],
  steviloUdelezencev: number,
): RezultatTocke {
  const za = glasovi.filter((g) => g.glas === 'za').length
  const proti = glasovi.filter((g) => g.glas === 'proti').length
  const vzdrzan = glasovi.filter((g) => g.glas === 'vzdrzan').length
  const skupaj = za + proti + vzdrzan
  const udelezba = steviloUdelezencev > 0 ? Math.round((skupaj / steviloUdelezencev) * 100) : 0
  return { za, proti, vzdrzan, skupaj, udelezba, sprejet: za > proti }
}
