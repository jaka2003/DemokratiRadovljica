import type { GlobalConfig } from 'payload'

// Javna stran kandidata/-ke za župana/-jo (spec. razdelek 6).
// Objavi se, ko je kandidat uradno predstavljen.
export const Kandidat: GlobalConfig = {
  slug: 'kandidat',
  label: 'Kandidat/-ka (javna stran)',
  admin: {
    group: 'Javna vsebina',
    description:
      'Vsebina javne strani »Kandidat«. Dokler ni odkljukano »Objavi stran kandidata«, obiskovalci vidijo napoved »kmalu«. Ko je kandidat predstavljen, vnesi podatke in odkljukaj objavo.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'objavljeno',
      label: 'Objavi stran kandidata',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Dokler ni obkljukano, stran prikazuje napoved "kmalu".' },
    },
    {
      type: 'row',
      fields: [
        { name: 'imePriimek', label: 'Ime in priimek', type: 'text', admin: { width: '60%' } },
        { name: 'kontaktEmail', label: 'Kontaktni e-naslov', type: 'email', admin: { width: '40%' } },
      ],
    },
    { name: 'fotografija', label: 'Fotografija', type: 'upload', relationTo: 'media' },
    { name: 'nagovor', label: 'Uvodni nagovor', type: 'textarea' },
    { name: 'izkusnje', label: 'Predstavitev izkušenj', type: 'textarea' },
    { name: 'pogledNaRazvoj', label: 'Pogled na razvoj občine', type: 'textarea' },
    {
      name: 'vrednote',
      label: 'Glavne vrednote',
      type: 'array',
      labels: { singular: 'Vrednota', plural: 'Vrednote' },
      fields: [
        { name: 'label', label: 'Naziv', type: 'text', required: true },
        {
          name: 'ikona',
          label: 'Ikona',
          type: 'select',
          defaultValue: 'shieldCheck',
          options: ['users', 'rocket', 'eye', 'shieldCheck', 'heartHandshake', 'scale', 'flag', 'compass'].map((i) => ({
            label: i,
            value: i,
          })),
        },
      ],
    },
    {
      name: 'videoUrl',
      label: 'Video nagovor (povezava YouTube/Vimeo)',
      type: 'text',
      admin: { description: 'Npr. https://www.youtube.com/watch?v=...' },
    },
  ],
}
