// Skupna logika za interni klepet ekipe (sobe + zasebna sporočila).
// Sobe so določene v kodi; vsak uporabnik vidi le sobe, do katerih ima dostop glede na vlogo.

export type Soba = {
  kljuc: string
  naziv: string
  ikona: string
  opis: string
  vloge: string[] // katere vloge imajo dostop; prazno = vsi prijavljeni
}

// Sobe klepeta. Dostop je določen z »vloge«: prazen seznam pomeni »vsi prijavljeni«.
// Administrator vedno vidi vse sobe. Za spremembe samo uredi ta seznam.
export const SOBE: Soba[] = [
  { kljuc: 'splosno', naziv: 'Splošno', ikona: '💬', opis: 'Skupni klepet za vse v ekipi.', vloge: [] },
  {
    kljuc: 'kampanja',
    naziv: 'Ekipa kampanje',
    ikona: '📣',
    opis: 'Usklajevanje kampanje – dogodki, naloge, obveščanje.',
    vloge: ['ekipa_kampanja', 'kandidat_svetnik', 'kandidat_zupan', 'urednik'],
  },
  {
    kljuc: 'kandidati',
    naziv: 'Kandidati',
    ikona: '🎖️',
    opis: 'Interni pogovor med kandidatkami in kandidati.',
    vloge: ['kandidat_svetnik', 'kandidat_zupan'],
  },
  { kljuc: 'mladi', naziv: 'Mladi demokrati', ikona: '⚡', opis: 'Klepet mladih demokratov.', vloge: ['mladi_demokrat'] },
  { kljuc: 'vodstvo', naziv: 'Vodstvo', ikona: '🛡️', opis: 'Interno za vodstvo in urednike vsebin.', vloge: ['urednik'] },
]

export const sobaPoKljucu = (kljuc: string): Soba | undefined => SOBE.find((s) => s.kljuc === kljuc)

const vlogeArray = (vloge: unknown): string[] =>
  Array.isArray(vloge) ? (vloge as string[]) : vloge ? [String(vloge)] : []

// Ali ima uporabnik (z danimi vlogami) dostop do sobe. Administrator ima dostop do vseh.
export const imaDostopDoSobe = (vloge: unknown, kljuc: string, jeAdmin = false): boolean => {
  const soba = sobaPoKljucu(kljuc)
  if (!soba) return false
  if (jeAdmin) return true
  if (soba.vloge.length === 0) return true
  const v = vlogeArray(vloge)
  return soba.vloge.some((r) => v.includes(r))
}

// Vse sobe, ki jih uporabnik vidi.
export const sobeZaUporabnika = (vloge: unknown, jeAdmin = false): Soba[] =>
  SOBE.filter((s) => imaDostopDoSobe(vloge, s.kljuc, jeAdmin))

// Kanonični ključ pogovora med dvema uporabnikoma (neodvisen od vrstnega reda pošiljatelj/prejemnik).
export const pogovorKljuc = (a: string | number, b: string | number): string =>
  [Number(a), Number(b)].sort((x, y) => x - y).join(':')

// ─── Lastne (custom) skupine iz baze ──────────────────────────────────────
// Sporočila lastnih skupin hranimo z »soba« ključem »db:<id>«, da jih ločimo od fiksnih sob.
export const customKljuc = (id: string | number): string => `db:${id}`

// Iz ključa »db:<id>« vrne številko skupine; za fiksne sobe vrne null.
export const customId = (kljuc: string): number | null => {
  if (!kljuc || !kljuc.startsWith('db:')) return null
  const n = Number(kljuc.slice(3))
  return Number.isFinite(n) && n > 0 ? n : null
}

export const jeCustomSoba = (kljuc: string): boolean => customId(kljuc) != null
