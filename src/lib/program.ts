import type { IconName } from './site'

// Privzeta programska področja (spec. razdelek 7). Ob prvem zagonu se vpišejo v CMS,
// nato jih administrator ureja brez programerja.
export type ProgramPodrocje = {
  slug: string
  naslov: string
  ikona: IconName
  kratekOpis: string
  povezanaKategorija?: string // ujemanje s kategorijo pobud (za prikaz povezanih pobud)
  uvod: string
  ukrepi: string[]
}

export const DEFAULT_PODROCJA: ProgramPodrocje[] = [
  {
    slug: 'razvoj-obcine',
    naslov: 'Razvoj občine',
    ikona: 'rocket',
    kratekOpis: 'Jasna razvojna ambicija s cilji, roki in odgovornostjo.',
    uvod: 'Radovljica potrebuje jasno razvojno smer – kompas s cilji, roki, stroški in odgovornimi nosilci. Razvoj načrtujemo skupaj z občani in ga javno spremljamo.',
    ukrepi: [
      'Kompas uspešne Radovljice: cilj, rok, stroški in odgovornost za vsak projekt.',
      'Projekti razvrščeni po rokih: 100 dni, prvo leto, 2028 in 2030.',
      'Javno spremljanje napredka projektov na spletni strani občine.',
    ],
  },
  {
    slug: 'obcinska-preglednost',
    naslov: 'Občinska preglednost',
    ikona: 'scale',
    kratekOpis: 'Občani morajo vedeti, kam gre javni denar.',
    uvod: 'Preglednost je temelj zaupanja. Poraba javnega denarja mora biti razumljiva, dostopna in javno objavljena.',
    ukrepi: [
      'Pregledna in razumljiva objava porabe javnega denarja.',
      'Javno dostopni podatki o naročilih, pogodbah in projektih.',
      'Redno poročanje občanom o izvajanju proračuna.',
    ],
  },
  {
    slug: 'krajevne-skupnosti',
    naslov: 'Krajevne skupnosti',
    ikona: 'landmark',
    kratekOpis: 'Več vpliva krajev pri določanju prioritet.',
    povezanaKategorija: 'komunala',
    uvod: 'Vsak kraj najbolje pozna svoje potrebe. Krajevnim skupnostim damo več vpliva pri določanju prioritet in razdelitvi sredstev.',
    ukrepi: [
      'Pet prioritet vsakega kraja – javno objavljeno in spremljano.',
      'Več vpliva krajevnih skupnosti pri določanju prioritet.',
      'Reden terenski pregled po krajih.',
    ],
  },
  {
    slug: 'promet-in-plocniki',
    naslov: 'Promet in pločniki',
    ikona: 'route',
    kratekOpis: 'Varnejše poti za pešce, otroke in kolesarje.',
    povezanaKategorija: 'plocniki',
    uvod: 'Varnost v prometu je prioriteta. Urejamo pločnike, kolesarske poti in nevarne točke v vseh krajih občine.',
    ukrepi: [
      'Terenski pregled cest, pločnikov in razsvetljave po krajih.',
      'Odprava nevarnih točk za pešce, otroke in kolesarje.',
      'Postopna gradnja manjkajočih pločnikov in kolesarskih povezav.',
    ],
  },
  {
    slug: 'parkirisca',
    naslov: 'Parkirišča',
    ikona: 'parking',
    kratekOpis: 'Več urejenih parkirnih mest tam, kjer so potrebna.',
    povezanaKategorija: 'parkirisca',
    uvod: 'Pomanjkanje parkirišč je vsakdanja težava. Z analizo potreb po krajih zagotovimo več urejenih parkirnih mest.',
    ukrepi: [
      'Analiza parkirnih potreb po krajih in ureditev novih mest.',
      'Ureditev parkiranja ob šolah, vrtcih in zdravstvenih ustanovah.',
      'Pregledna pravila parkiranja v mestnem jedru.',
    ],
  },
  {
    slug: 'kanalizacija-in-komunala',
    naslov: 'Kanalizacija in komunalna infrastruktura',
    ikona: 'droplets',
    kratekOpis: 'Posodobitev vodovoda, kanalizacije in komunale.',
    povezanaKategorija: 'kanalizacija',
    uvod: 'Zanesljiva komunalna infrastruktura je osnova kakovostnega življenja. Načrtno posodabljamo vodovod, kanalizacijo in komunalno opremo.',
    ukrepi: [
      'Načrt obnove vodovodnega in kanalizacijskega omrežja.',
      'Priključitev krajev brez urejene kanalizacije.',
      'Vlaganje v zanesljivo oskrbo s pitno vodo.',
    ],
  },
  {
    slug: 'stanovanja-in-zemljisca',
    naslov: 'Stanovanja in zemljišča',
    ikona: 'home',
    kratekOpis: 'Več zemljišč za gradnjo domov za mlade družine.',
    povezanaKategorija: 'stanovanja',
    uvod: 'Mladi in družine potrebujejo dostopne domove. Z jasnim zemljiškim in stanovanjskim načrtom sprostimo več zemljišč za gradnjo.',
    ukrepi: [
      'Jasen zemljiški in stanovanjski načrt občine.',
      'Več zemljišč za gradnjo domov za mlade družine.',
      'Spodbude za najemna in dostopna stanovanja.',
    ],
  },
  {
    slug: 'podjetnistvo-in-obrt',
    naslov: 'Podjetništvo in obrt',
    ikona: 'briefcase',
    kratekOpis: 'Prostor in podpora za širitev dejavnosti.',
    povezanaKategorija: 'podjetnistvo',
    uvod: 'Lokalno gospodarstvo ustvarja delovna mesta. Podjetjem in obrtnikom zagotovimo prostor in podporo za rast.',
    ukrepi: [
      'Podpora podjetjem pri širitvi dejavnosti in iskanju prostora.',
      'Hitrejši postopki za podjetnike na občini.',
      'Spodbujanje lokalne obrti in podjetništva.',
    ],
  },
  {
    slug: 'sport-in-rekreacija',
    naslov: 'Šport in rekreacija',
    ikona: 'dumbbell',
    kratekOpis: 'Urejene športne in rekreacijske površine za vse.',
    povezanaKategorija: 'sport',
    uvod: 'Šport povezuje skupnost in skrbi za zdravje. Vlagamo v dostopne športne in rekreacijske površine v vseh krajih.',
    ukrepi: [
      'Obnova in vzdrževanje športnih objektov in igrišč.',
      'Podpora športnim društvom in rekreaciji za vse generacije.',
      'Urejene tekaške, kolesarske in sprehajalne poti.',
    ],
  },
  {
    slug: 'mladi-in-druzine',
    naslov: 'Mladi in družine',
    ikona: 'users',
    kratekOpis: 'Vrtci, igrišča in priložnosti za mlade.',
    povezanaKategorija: 'mladina',
    uvod: 'Mladim in družinam zagotavljamo pogoje za dobro življenje – od vrtcev in igrišč do priložnosti za mlade.',
    ukrepi: [
      'Zadostne kapacitete vrtcev in šol.',
      'Urejena in varna otroška igrišča v vseh krajih.',
      'Prostori in programi za mlade.',
    ],
  },
  {
    slug: 'starejsi',
    naslov: 'Starejši',
    ikona: 'heartHandshake',
    kratekOpis: 'Dostojno in povezano življenje za starejše.',
    povezanaKategorija: 'starejsi',
    uvod: 'Skrbimo za dostojno in aktivno življenje starejših – z dostopnimi storitvami, prevozi in medgeneracijskim povezovanjem.',
    ukrepi: [
      'Podpora storitvam pomoči na domu in oskrbi starejših.',
      'Dostopni prevozi in javni prostori brez ovir.',
      'Medgeneracijski programi in druženje.',
    ],
  },
  {
    slug: 'turizem',
    naslov: 'Turizem',
    ikona: 'mountain',
    kratekOpis: 'Trajnostni razvoj turizma celotne občine.',
    povezanaKategorija: 'turizem',
    uvod: 'Radovljica ima izjemen turistični potencial. Razvijamo trajnostni turizem, ki koristi domačinom in krajem.',
    ukrepi: [
      'Promocija naravne in kulturne dediščine občine.',
      'Povezovanje turistične ponudbe vseh krajev.',
      'Urejena turistična infrastruktura in označbe.',
    ],
  },
  {
    slug: 'okolje-in-urejen-prostor',
    naslov: 'Okolje in urejen prostor',
    ikona: 'trees',
    kratekOpis: 'Čisto okolje in urejena javna podoba krajev.',
    povezanaKategorija: 'okolje',
    uvod: 'Urejen in čist prostor je odraz skrbne občine. Skrbimo za zelene površine, ravnanje z odpadki in lepo podobo krajev.',
    ukrepi: [
      'Urejene zelene površine in javni prostori.',
      'Boljše ravnanje z odpadki in čistejše okolje.',
      'Skrb za urejeno podobo mestnega jedra in krajev.',
    ],
  },
  {
    slug: 'digitalna-obcina',
    naslov: 'Digitalna občina',
    ikona: 'smartphone',
    kratekOpis: 'Občina kot hiter in dostopen servis ljudi.',
    uvod: 'Sodobna občina je dostopna in odzivna. Z digitalnimi storitvami skrajšamo postopke in približamo občino ljudem.',
    ukrepi: [
      'Občina kot servis ljudi: hitrejši odgovori in jasni postopki.',
      'Digitalne pobude in spletno spremljanje vlog.',
      'Preprost dostop do informacij in storitev na enem mestu.',
    ],
  },
]
