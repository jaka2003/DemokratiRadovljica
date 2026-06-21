import type { CollectionConfig } from 'payload'

// Novice / aktualne objave (spec. razdelki 3.7, 4, 5, 6, 7).
export const Novice: CollectionConfig = {
  slug: 'novice',
  labels: { singular: 'Novica', plural: 'Novice' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'datum', 'objavljeno'],
    group: 'Javna vsebina',
    description:
      'Aktualne novice in objave. Prikažejo se na strani »Novice«, lahko pa jih povežeš s krajem, programskim področjem ali stranjo kandidata.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: '-datum',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'naslov', label: 'Naslov', type: 'text', required: true, admin: { width: '70%' } },
        { name: 'objavljeno', label: 'Objavljeno', type: 'checkbox', defaultValue: true, admin: { width: '30%' } },
      ],
    },
    {
      name: 'slug',
      label: 'URL (slug)',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Naslov v povezavi, brez šumnikov in presledkov.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'datum',
          label: 'Datum objave',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd. M. yyyy' },
            description: 'Privzeto današnji datum – spremeni le, če želiš drug datum objave.',
          },
        },
        { name: 'slika', label: 'Naslovna slika', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
      ],
    },
    { name: 'povzetek', label: 'Kratek povzetek', type: 'textarea' },
    { name: 'vsebina', label: 'Vsebina', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'kraj',
          label: 'Poveži s krajem',
          type: 'relationship',
          relationTo: 'kraji',
          admin: { width: '50%', description: 'Neobvezno – prikaže se na podstrani tega kraja.' },
        },
        {
          name: 'podrocje',
          label: 'Poveži s programskim področjem',
          type: 'relationship',
          relationTo: 'programska-podrocja',
          admin: { width: '50%', description: 'Neobvezno – prikaže se na podstrani področja.' },
        },
      ],
    },
    {
      name: 'naKandidatovi',
      label: 'Prikaži med objavami kandidata',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
