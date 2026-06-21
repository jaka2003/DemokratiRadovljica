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
          fields: [
            { name: 'heroNaslov', label: 'Naslov', type: 'text', defaultValue: 'USPEŠNA RADOVLJICA 2026–2034' },
            { name: 'heroPodnaslov', label: 'Podnaslov', type: 'text', defaultValue: 'Radovljica potrebuje novo razvojno ambicijo.' },
            {
              name: 'heroOpis',
              label: 'Kratek opis',
              type: 'textarea',
              defaultValue:
                'Program konkretnih rešitev, ki nastaja iz resničnih težav ljudi, krajev in vsakdanjega življenja v občini Radovljica.',
            },
            { name: 'heroPoudarek', label: 'Dodatni poudarek', type: 'text', defaultValue: 'Občina vseh krajev, vseh generacij in vseh ljudi.' },
            { name: 'heroTagline', label: 'Slogan', type: 'text', defaultValue: 'Sodeluj. Predlagaj. Soustvarjaj.' },
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
