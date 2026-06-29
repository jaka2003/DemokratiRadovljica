import type { CollectionConfig } from 'payload'
import { adminOrUrednik, skritoRazenUrednik } from '../access/roles'
import { slugify } from '../lib/slug'

// Novice / aktualne objave (spec. razdelki 3.7, 4, 5, 6, 7).
export const Novice: CollectionConfig = {
  slug: 'novice',
  labels: { singular: 'Novica', plural: 'Novice' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'datum', 'objavljeno'],
    listSearchableFields: ['naslov'],
    group: 'Vsebina strani',
    hidden: skritoRazenUrednik,
    description:
      'Aktualne novice in objave. Prikažejo se na strani »Novice«, lahko pa jih povežeš s krajem, programskim področjem ali stranjo kandidata.',
  },
  access: {
    read: () => true,
    create: adminOrUrednik,
    update: adminOrUrednik,
    delete: adminOrUrednik,
  },
  defaultSort: '-datum',
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.naslov) data.slug = slugify(data.naslov)
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'naslov', label: 'Naslov', type: 'text', required: true, admin: { width: '70%' } },
        { name: 'objavljeno', label: 'Objavljeno', type: 'checkbox', defaultValue: true, admin: { width: '30%', components: { Cell: '/components/admin/DaNeCell#DaNeCell' } } },
      ],
    },
    {
      name: 'slug',
      label: 'Spletni naslov (samodejno)',
      type: 'text',
      unique: true,
      admin: {
        description: 'Pusti prazno – ustvari se samodejno iz naslova. (Del povezave do novice.)',
      },
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
