import type { GlobalConfig } from 'payload'

// Globalne nastavitve strani – kontakt, družbena omrežja, poslanstvo, vrednote.
export const Nastavitve: GlobalConfig = {
  slug: 'nastavitve',
  label: 'Nastavitve strani',
  admin: {
    group: 'Javna vsebina',
    description:
      'Splošne nastavitve: poslanstvo, vrednote, kontakt in družbena omrežja. Prikaže se na strani »Demokrati Radovljica« in v nogi strani.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'tipVolitev',
      label: 'Kako nastopate na lokalnih volitvah',
      type: 'select',
      required: true,
      defaultValue: 'zupan_lista',
      options: [
        { label: 'Kandidat za župana + lista za občinski svet', value: 'zupan_lista' },
        { label: 'Samo lista za občinski svet (brez kandidata za župana)', value: 'samo_svet' },
      ],
      admin: {
        description:
          'Določa stran »Lokalne volitve«: pri prvi možnosti se zgoraj prikaže kandidat za župana, pri drugi le kandidati za svetnike.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Demokrati Radovljica',
          fields: [
            {
              name: 'poslanstvo',
              label: 'Poslanstvo',
              type: 'textarea',
              defaultValue:
                'Smo lokalna ekipa, ki želi občino Radovljica voditi odgovorno, pregledno in razvojno. Verjamemo, da dobre rešitve nastanejo iz poslušanja ljudi in sodelovanja vseh krajev.',
            },
            {
              name: 'strankaUrl',
              label: 'Povezava na stranko Demokrati',
              type: 'text',
              defaultValue: 'https://demokrati.si',
              admin: { description: 'Povezava na nacionalno stran stranke (prikazana na strani Demokrati Radovljica).' },
            },
            {
              name: 'nacinDela',
              label: 'Način dela',
              type: 'textarea',
              defaultValue:
                'Vprašamo ljudi, zberemo predloge, jih uredimo po področjih in pripravimo konkretne rešitve, ki jih vključimo v program. Vsak korak je javen in spremljan.',
            },
            {
              name: 'vrednote',
              label: 'Vrednote',
              type: 'array',
              labels: { singular: 'Vrednota', plural: 'Vrednote' },
              defaultValue: [
                { label: 'Sodelovanje', ikona: 'users' },
                { label: 'Razvoj', ikona: 'rocket' },
                { label: 'Preglednost', ikona: 'eye' },
                { label: 'Odgovornost', ikona: 'shieldCheck' },
              ],
              fields: [
                { name: 'label', label: 'Naziv', type: 'text', required: true },
                {
                  name: 'ikona',
                  label: 'Ikona',
                  type: 'select',
                  defaultValue: 'shieldCheck',
                  options: ['users', 'rocket', 'eye', 'shieldCheck', 'heartHandshake', 'scale', 'flag', 'compass'].map(
                    (i) => ({ label: i, value: i }),
                  ),
                },
              ],
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            { name: 'email', label: 'Kontaktni e-naslov', type: 'email', defaultValue: 'info@demokratiradovljica.com' },
            { name: 'telefon', label: 'Telefon', type: 'text' },
            { name: 'naslov', label: 'Naslov', type: 'text' },
          ],
        },
        {
          label: 'Potrebni dokumenti kandidatov',
          description: 'Seznam dokumentov, ki jih kandidat vidi v svojem profilu in jih mora naložiti.',
          fields: [
            {
              name: 'potrebniDokumenti',
              label: 'Seznam potrebnih dokumentov',
              type: 'array',
              labels: { singular: 'Dokument', plural: 'Dokumenti' },
              defaultValue: [
                { naziv: 'Soglasje za kandidaturo' },
                { naziv: 'Izjava o obdelavi osebnih podatkov' },
                { naziv: 'Fotografija za objavo' },
              ],
              fields: [{ name: 'naziv', label: 'Naziv dokumenta', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Družbena omrežja',
          fields: [
            {
              name: 'druzbenaOmrezja',
              label: 'Povezave',
              type: 'array',
              labels: { singular: 'Povezava', plural: 'Povezave' },
              fields: [
                {
                  name: 'platforma',
                  label: 'Platforma',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'X / Twitter', value: 'x' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'LinkedIn', value: 'linkedin' },
                  ],
                },
                { name: 'url', label: 'Povezava (URL)', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
