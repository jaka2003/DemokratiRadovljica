// Konstante za modul Pobude občanov (spec. razdelki 3.6, 6, 11.3).

// Kategorije pobud (spec. 3.6). value = shranjena vrednost, color = barva oznake na zemljevidu.
export const POBUDA_KATEGORIJE = [
  { value: 'ceste', label: 'Ceste', color: '#ef4444' },
  { value: 'plocniki', label: 'Pločniki', color: '#f97316' },
  { value: 'parkirisca', label: 'Parkirišča', color: '#eab308' },
  { value: 'razsvetljava', label: 'Javna razsvetljava', color: '#f59e0b' },
  { value: 'kanalizacija', label: 'Kanalizacija', color: '#8b5cf6' },
  { value: 'vodovod', label: 'Vodovod', color: '#3b82f6' },
  { value: 'komunala', label: 'Komunalna infrastruktura', color: '#6366f1' },
  { value: 'sport', label: 'Šport', color: '#10b981' },
  { value: 'igrisca', label: 'Otroška igrišča', color: '#14b8a6' },
  { value: 'mladina', label: 'Mladina', color: '#06b6d4' },
  { value: 'starejsi', label: 'Starejši', color: '#0ea5e9' },
  { value: 'stanovanja', label: 'Stanovanja', color: '#d946ef' },
  { value: 'zemljisca', label: 'Zemljišča', color: '#a855f7' },
  { value: 'podjetnistvo', label: 'Podjetništvo', color: '#0f766e' },
  { value: 'okolje', label: 'Okolje', color: '#22c55e' },
  { value: 'turizem', label: 'Turizem', color: '#00bbc1' },
  { value: 'drugo', label: 'Drugo', color: '#64748b' },
] as const

export type PobudaKategorija = (typeof POBUDA_KATEGORIJE)[number]['value']

export function kategorijaInfo(value: string) {
  return POBUDA_KATEGORIJE.find((k) => k.value === value) ?? POBUDA_KATEGORIJE[POBUDA_KATEGORIJE.length - 1]
}

// Kraji občine Radovljica (krajevne skupnosti / glavna naselja).
// Administrator lahko seznam pozneje razširi.
export const KRAJI = [
  'Radovljica',
  'Lesce',
  'Begunje na Gorenjskem',
  'Brezje',
  'Mošnje',
  'Kropa',
  'Kamna Gorica',
  'Ljubno',
  'Podnart',
  'Srednja Dobrava',
  'Zgoša',
  'Hlebce',
  'Otok',
  'Posavec',
  'Drugo / izven seznama',
] as const

// Približna središča naselij (za samodejno izbiro kraja glede na klik na zemljevidu).
export const KRAJI_COORDS: { name: string; lat: number; lng: number }[] = [
  { name: 'Radovljica', lat: 46.34351, lng: 14.17202 },
  { name: 'Lesce', lat: 46.3618, lng: 14.15444 },
  { name: 'Begunje na Gorenjskem', lat: 46.37461, lng: 14.19979 },
  { name: 'Brezje', lat: 46.3281, lng: 14.23277 },
  { name: 'Mošnje', lat: 46.33549, lng: 14.21073 },
  { name: 'Kropa', lat: 46.29109, lng: 14.2047 },
  { name: 'Kamna Gorica', lat: 46.31707, lng: 14.19453 },
  { name: 'Ljubno', lat: 46.31296, lng: 14.24683 },
  { name: 'Podnart', lat: 46.2971, lng: 14.25452 },
  { name: 'Srednja Dobrava', lat: 46.30573, lng: 14.22052 },
  { name: 'Zgoša', lat: 46.36886, lng: 14.19691 },
  { name: 'Hlebce', lat: 46.36682, lng: 14.17877 },
  { name: 'Otok', lat: 46.34966, lng: 14.20514 },
  { name: 'Posavec', lat: 46.31061, lng: 14.23974 },
]

// Vrne ime najbližjega naselja glede na koordinati (utežena evklidska razdalja).
export function nearestKraj(lat: number, lng: number): string {
  const cos = Math.cos((lat * Math.PI) / 180)
  let best = KRAJI_COORDS[0]
  let bestD = Infinity
  for (const k of KRAJI_COORDS) {
    const dLat = k.lat - lat
    const dLng = (k.lng - lng) * cos
    const d = dLat * dLat + dLng * dLng
    if (d < bestD) {
      bestD = d
      best = k
    }
  }
  return best.name
}

// Statusi pobude (spec. 11.3).
export const POBUDA_STATUSI = [
  { value: 'nova', label: 'Nova' },
  { value: 'v_pregledu', label: 'V pregledu' },
  { value: 'ogled_terena', label: 'Potreben ogled na terenu' },
  { value: 'v_programu', label: 'Vključena v program' },
  { value: 'posredovana', label: 'Posredovana pristojnemu organu' },
  { value: 'resena', label: 'Rešena' },
  { value: 'zakljucena', label: 'Zaključena' },
  { value: 'zavrnjena', label: 'Neprimerna / zavrnjena' },
] as const

export function statusInfo(value: string) {
  return POBUDA_STATUSI.find((s) => s.value === value) ?? POBUDA_STATUSI[0]
}

// Središče in privzeti zoom zemljevida občine Radovljica.
export const MAP_CENTER: [number, number] = [46.3442, 14.1744]
export const MAP_ZOOM = 12
