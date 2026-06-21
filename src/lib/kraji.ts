// Privzeti kraji občine Radovljica. Ob prvem zagonu se vpišejo v CMS,
// nato jih administrator ureja (opis, fotografije, teme, projekti).

export type KrajDefault = {
  naslov: string
  slug: string
  lat: number
  lng: number
  opis: string
}

export const KRAJ_DEFAULTS: KrajDefault[] = [
  {
    naslov: 'Radovljica',
    slug: 'radovljica',
    lat: 46.34351,
    lng: 14.17202,
    opis: 'Središče občine z ohranjenim srednjeveškim mestnim jedrom in razgledom na Gorenjsko.',
  },
  {
    naslov: 'Lesce',
    slug: 'lesce',
    lat: 46.3618,
    lng: 14.15444,
    opis: 'Živahen kraj ob letališču in priljubljena izhodiščna točka za rekreacijo ob Savi.',
  },
  {
    naslov: 'Begunje na Gorenjskem',
    slug: 'begunje-na-gorenjskem',
    lat: 46.37461,
    lng: 14.19979,
    opis: 'Vas pod Dobrčo, znana po narodno-zabavni glasbi in mirni naravi pod gorami.',
  },
  {
    naslov: 'Brezje',
    slug: 'brezje',
    lat: 46.3281,
    lng: 14.23277,
    opis: 'Najpomembnejše romarsko središče v Sloveniji z baziliko Marije Pomagaj.',
  },
  {
    naslov: 'Mošnje',
    slug: 'mosnje',
    lat: 46.33549,
    lng: 14.21073,
    opis: 'Kraj z bogato zgodovino in arheološko dediščino ob vznožju polja.',
  },
  {
    naslov: 'Kropa',
    slug: 'kropa',
    lat: 46.29109,
    lng: 14.2047,
    opis: 'Slikovita kovaška vas v dolini Lipnice z železarsko tradicijo.',
  },
  {
    naslov: 'Kamna Gorica',
    slug: 'kamna-gorica',
    lat: 46.31707,
    lng: 14.19453,
    opis: 'Vas z železarsko zgodovino in urejenim starim vaškim jedrom.',
  },
  {
    naslov: 'Ljubno',
    slug: 'ljubno',
    lat: 46.31296,
    lng: 14.24683,
    opis: 'Mirno naselje v dolini Save med Radovljico in Podnartom.',
  },
  {
    naslov: 'Podnart',
    slug: 'podnart',
    lat: 46.2971,
    lng: 14.25452,
    opis: 'Kraj ob Savi z železniško postajo in dostopom do doline Lipnice.',
  },
  {
    naslov: 'Srednja Dobrava',
    slug: 'srednja-dobrava',
    lat: 46.30573,
    lng: 14.22052,
    opis: 'Naselje na dobravski terasi z razgledom na okoliške hribe.',
  },
  {
    naslov: 'Zgoša',
    slug: 'zgosa',
    lat: 46.36886,
    lng: 14.19691,
    opis: 'Vas pod Begunjami z urejeno podeželsko podobo.',
  },
  {
    naslov: 'Hlebce',
    slug: 'hlebce',
    lat: 46.36682,
    lng: 14.17877,
    opis: 'Naselje med Lescami in Begunjami sredi gorenjskega polja.',
  },
  {
    naslov: 'Otok',
    slug: 'otok',
    lat: 46.34966,
    lng: 14.20514,
    opis: 'Manjši kraj v občini z mirnim podeželskim okoljem.',
  },
  {
    naslov: 'Posavec',
    slug: 'posavec',
    lat: 46.31061,
    lng: 14.23974,
    opis: 'Vas nad dolino Save z razgledi na Gorenjsko.',
  },
]
