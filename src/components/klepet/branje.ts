// Sledenje prebranim sporočilom v brskalniku (localStorage). Deli se med stranjo klepeta
// in značko neprebranih v meniju. Hranimo zadnji prebrani ID na kanal.

export const BRANJE_KEY = 'demokrati_klepet_branje'

export const kljucSobe = (kljuc: string): string => `soba:${kljuc}`
export const kljucDm = (uporabnikId: number): string => `dm:${uporabnikId}`

export function nalozjBranje(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(BRANJE_KEY) || '{}') as Record<string, number>
  } catch {
    return {}
  }
}

export function shraniBranje(map: Record<string, number>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(BRANJE_KEY, JSON.stringify(map))
  } catch {
    /* npr. zaseben način brez shrambe – neusodno */
  }
}
