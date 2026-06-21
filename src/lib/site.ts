// Centralna vsebina javne strani (spec. razdelek 3).
// V kasnejši fazi se to preseli v Payload CMS, da je urejivo brez programerja.

export type IconName =
  | 'users'
  | 'building'
  | 'user'
  | 'fileText'
  | 'mapPin'
  | 'lock'
  | 'rocket'
  | 'eye'
  | 'shieldCheck'
  | 'messageSquare'
  | 'list'
  | 'map'
  | 'bell'
  | 'userPlus'
  | 'compass'
  | 'flag'
  | 'route'
  | 'home'
  | 'briefcase'
  | 'wallet'
  | 'calendarClock'
  | 'landmark'
  | 'trafficCone'
  | 'headset'
  | 'scale'
  | 'parking'
  | 'droplets'
  | 'dumbbell'
  | 'heartHandshake'
  | 'mountain'
  | 'trees'
  | 'smartphone'

export const SITE = {
  name: 'Demokrati Radovljica',
  shortName: 'Demokrati Radovljica',
  electionLine: 'Lokalne volitve 2026',
}

export const NAV: { label: string; href: string }[] = [
  { label: 'Domov', href: '/' },
  { label: 'Občina', href: '/obcina' },
  { label: 'Lokalne volitve', href: '/lokalne-volitve' },
  { label: 'Program', href: '/program' },
  { label: 'Pobude in zemljevid', href: '/pobude' },
]

export const HERO = {
  title: 'USPEŠNA RADOVLJICA 2026–2034',
  subtitle: 'Radovljica potrebuje novo razvojno ambicijo.',
  description:
    'Program konkretnih rešitev, ki nastaja iz resničnih težav ljudi, krajev in vsakdanjega življenja v občini Radovljica.',
  emphasis: 'Občina vseh krajev, vseh generacij in vseh ljudi.',
  tagline: 'Sodeluj. Predlagaj. Soustvarjaj.',
  primaryCta: { label: 'Spoznaj program', href: '/program' },
  secondaryCta: { label: 'Oddaj pobudo', href: '/pobude' },
}

// 3.2 Hitre povezave do podstrani
export const QUICK_LINKS: { title: string; href: string; icon: IconName }[] = [
  { title: 'Demokrati Radovljica', href: '/demokrati', icon: 'users' },
  { title: 'Občina Radovljica', href: '/obcina', icon: 'building' },
  { title: 'Lokalne volitve in kandidati', href: '/lokalne-volitve', icon: 'user' },
  { title: 'Program', href: '/program', icon: 'fileText' },
  { title: 'Pobude občanov in zemljevid', href: '/pobude', icon: 'mapPin' },
  { title: 'Interna prijava', href: '/admin', icon: 'lock' },
]

// 3.3 Predstavitev Demokratov Radovljica
export const IDENTITY = {
  title: 'Demokrati Radovljica',
  description: 'Lokalna ekipa za odgovorno, pregledno in razvojno občino.',
  values: [
    { label: 'Razvoj', icon: 'rocket' as IconName },
    { label: 'Preglednost', icon: 'eye' as IconName },
    { label: 'Odločnost', icon: 'shieldCheck' as IconName },
  ],
}

// 3.4 Kako nastaja program
export const PROGRAM_STEPS: { number: number; title: string; icon: IconName }[] = [
  { number: 1, title: 'Vprašamo ljudi', icon: 'messageSquare' },
  { number: 2, title: 'Zberemo predloge', icon: 'list' },
  { number: 3, title: 'Uredimo po področjih', icon: 'fileText' },
  { number: 4, title: 'Predlagamo rešitve', icon: 'compass' },
  { number: 5, title: 'Vključimo v program', icon: 'flag' },
]

// 3.5 Prvi konkretni predlogi (10 kartic)
export const PROPOSALS: {
  number: number
  title: string
  subtitle: string
  icon: IconName
  href: string
}[] = [
  {
    number: 1,
    title: 'Kompas uspešne Radovljice',
    subtitle: 'Cilj, rok, stroški, odgovornost.',
    icon: 'compass',
    href: '/program/razvoj-obcine',
  },
  {
    number: 2,
    title: 'Pet prioritet vsakega kraja',
    subtitle: 'Javno objavljeno in spremljano.',
    icon: 'flag',
    href: '/program/krajevne-skupnosti',
  },
  {
    number: 3,
    title: 'Terenski pregled po krajih',
    subtitle: 'Ceste, pločniki, parkirišča, razsvetljava.',
    icon: 'route',
    href: '/program/promet-in-plocniki',
  },
  {
    number: 4,
    title: 'Več zemljišč za gradnjo domov',
    subtitle: 'Jasen zemljiški in stanovanjski načrt.',
    icon: 'home',
    href: '/program/stanovanja-in-zemljisca',
  },
  {
    number: 5,
    title: 'Podpora podjetjem pri širitvi dejavnosti',
    subtitle: 'Prostor za širitev dejavnosti.',
    icon: 'briefcase',
    href: '/program/podjetnistvo-in-obrt',
  },
  {
    number: 6,
    title: 'Pregledna poraba javnega denarja',
    subtitle: 'Občani morajo vedeti, kam gre denar.',
    icon: 'wallet',
    href: '/program/obcinska-preglednost',
  },
  {
    number: 7,
    title: 'Projekti po rokih in prioritetah',
    subtitle: '100 dni, prvo leto, 2028 in 2030.',
    icon: 'calendarClock',
    href: '/program/razvoj-obcine',
  },
  {
    number: 8,
    title: 'Večja vloga krajevnih skupnosti',
    subtitle: 'Več vpliva pri določanju prioritet.',
    icon: 'landmark',
    href: '/program/krajevne-skupnosti',
  },
  {
    number: 9,
    title: 'Urejanje prometa, parkirišč in nevarnih točk',
    subtitle: 'Varnejše poti za pešce, otroke in kolesarje.',
    icon: 'trafficCone',
    href: '/program/promet-in-plocniki',
  },
  {
    number: 10,
    title: 'Občina kot servis ljudi',
    subtitle: 'Hitrejši odgovori in digitalne pobude.',
    icon: 'headset',
    href: '/program/digitalna-obcina',
  },
]

// 3.7 Zaključni blok – sodeluj
export const PARTICIPATE = {
  title: 'Sodeluj pri programu',
  subtitle: 'Skupaj gradimo občino, v kateri se dobro živi vsem generacijam.',
  cards: [
    { title: 'Pridruži se', subtitle: 'Postani del ekipe.', icon: 'userPlus' as IconName, href: '/demokrati' },
    { title: 'Pošlji pobudo', subtitle: 'Tvoj predlog šteje.', icon: 'mapPin' as IconName, href: '/pobude' },
    { title: 'Spremljaj aktualno', subtitle: 'Novice, dogodki in obvestila.', icon: 'bell' as IconName, href: '/novice' },
  ],
}
