import type { GlobalConfig } from 'payload'

// Vsebina domače strani, urejljiva v adminu (spec. 3.1 fotografija, 3.4 koraki).
export const DomacaStran: GlobalConfig = {
  slug: 'domaca-stran',
  label: 'Domača stran',
  admin: {
    group: 'Javna vsebina',
    description: 'Besedila in fotografija uvodnega bloka domače strani ter koraki »Kako nastaja program«.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Uvodni blok (hero)',
          description: 'To je prvo, kar obiskovalec vidi na vrhu domače strani – velik naslov, opis in fotografija.',
          fields: [
            {
              name: 'heroNaslov',
              label: 'Naslov',
              type: 'text',
              defaultValue: 'USPEŠNA RADOVLJICA 2026–2034',
              admin: { description: 'Velik glavni naslov na vrhu domače strani.' },
            },
            {
              name: 'heroPodnaslov',
              label: 'Podnaslov',
              type: 'text',
              defaultValue: 'Radovljica potrebuje novo razvojno ambicijo.',
              admin: { description: 'Krepka vrstica pod naslovom.' },
            },
            {
              name: 'heroOpis',
              label: 'Kratek opis',
              type: 'textarea',
              defaultValue:
                'Program konkretnih rešitev, ki nastaja iz resničnih težav ljudi, krajev in vsakdanjega življenja v občini Radovljica.',
              admin: { description: 'Nekaj stavkov pod podnaslovom.' },
            },
            {
              name: 'heroPoudarek',
              label: 'Dodatni poudarek',
              type: 'text',
              defaultValue: 'Občina vseh krajev, vseh generacij in vseh ljudi.',
              admin: { description: 'Poudarjena misel nad gumboma.' },
            },
            {
              name: 'heroTagline',
              label: 'Slogan',
              type: 'text',
              defaultValue: 'Sodeluj. Predlagaj. Soustvarjaj.',
              admin: { description: 'Turkizni slogan tik nad gumboma.' },
            },
            {
              name: 'heroFoto',
              label: 'Fotografija Radovljice',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Naloži realno fotografijo Radovljice. Če ni naložena, se prikaže privzeto ozadje.' },
            },
          ],
        },
        {
          label: 'Kako nastaja program',
          fields: [
            {
              name: 'koraki',
              label: 'Koraki',
              type: 'array',
              labels: { singular: 'Korak', plural: 'Koraki' },
              minRows: 0,
              maxRows: 6,
              defaultValue: [
                { naslov: 'Vprašamo ljudi' },
                { naslov: 'Zberemo predloge' },
                { naslov: 'Uredimo po področjih' },
                { naslov: 'Predlagamo rešitve' },
                { naslov: 'Vključimo v program' },
              ],
              fields: [{ name: 'naslov', label: 'Naslov koraka', type: 'text', required: true }],
            },
          ],
        },
      ],
    },
  ],
}
