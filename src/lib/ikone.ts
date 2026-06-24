// Razumljive slovenske oznake za izbiro ikon v administraciji.
// VREDNOSTI ostanejo enake (uporablja jih javna stran), spremenjene so le oznake (labels).
export const IKONA_LABELS: Record<string, string> = {
  users: 'Ljudje / sodelovanje',
  rocket: 'Raketa / razvoj',
  eye: 'Oko / preglednost',
  shieldCheck: 'Ščit / odgovornost',
  heartHandshake: 'Rokovanje / pomoč',
  scale: 'Tehtnica / pravičnost',
  flag: 'Zastava',
  compass: 'Kompas / smer',
  landmark: 'Ustanova / uprava',
  route: 'Pot / promet',
  parking: 'Parkirišče',
  droplets: 'Voda / komunala',
  home: 'Dom / bivanje',
  briefcase: 'Gospodarstvo / delo',
  dumbbell: 'Šport',
  mountain: 'Gore / okolje',
  trees: 'Narava / zelenje',
  smartphone: 'Digitalizacija',
  wallet: 'Finance',
  fileText: 'Dokument',
  mapPin: 'Lokacija',
  building: 'Stavba',
  user: 'Oseba',
  messageSquare: 'Sporočilo',
  list: 'Seznam',
  map: 'Zemljevid',
  bell: 'Obvestilo',
  userPlus: 'Nov član',
  calendarClock: 'Termin / koledar',
  trafficCone: 'Dela / promet',
  headset: 'Podpora',
}

// Vrne možnosti za select s slovenskimi oznakami (vrednosti ostanejo enake).
export function ikonaOptions(values: readonly string[]) {
  return values.map((v) => ({ label: IKONA_LABELS[v] || v, value: v }))
}
