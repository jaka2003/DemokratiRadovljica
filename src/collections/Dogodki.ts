import type { CollectionConfig } from 'payload'
import { adminOrUrednik, VLOGE, skritoRazenAdmin } from '../access/roles'

export const DOGODEK_TIPI = [
  { label: 'Sestanek', value: 'sestanek' },
  { label: 'Slikanje', value: 'slikanje' },
  { label: 'Debata', value: 'debata' },
  { label: 'Dogodek', value: 'dogodek' },
  { label: 'Drugo', value: 'drugo' },
] as const

export const DOGODEK_STATUSI = [
  { label: 'Načrtovano', value: 'nacrtovano' },
  { label: 'Potrjeno', value: 'potrjeno' },
  { label: 'Preklicano', value: 'preklicano' },
] as const

// Koledar kampanje – sestanki, slikanja, debate in drugi dogodki ekipe.
export const Dogodki: CollectionConfig = {
  slug: 'dogodki',
  labels: { singular: 'Dogodek', plural: 'Koledar / dogodki' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'tip', 'zacetek', 'lokacija', 'status'],
    group: 'Ljudje in kampanja',
    hidden: skritoRazenAdmin,
    defaultSort: 'zacetek',
    description:
      'Koledar kampanje – sestanki, slikanja, debate in drugi dogodki. Prijavljeni jih vidijo na strani »Koledar« (povezava v meniju).',
  },
  access: {
    // Prijavljeni (ekipa) vidijo koledar; urejajo ga admin in uredniki.
    read: ({ req }) => Boolean(req.user),
    create: adminOrUrednik,
    update: adminOrUrednik,
    delete: adminOrUrednik,
  },
  defaultSort: 'zacetek',
  fields: [
    { name: 'naslov', label: 'Naslov', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'tip',
          label: 'Vrsta',
          type: 'select',
          required: true,
          defaultValue: 'sestanek',
          options: [...DOGODEK_TIPI],
          admin: { width: '50%' },
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'nacrtovano',
          options: [...DOGODEK_STATUSI],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'zacetek',
          label: 'Začetek',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', displayFormat: 'd. M. yyyy, HH:mm' },
          },
        },
        {
          name: 'konec',
          label: 'Konec (neobvezno)',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', displayFormat: 'd. M. yyyy, HH:mm' },
          },
        },
      ],
    },
    { name: 'lokacija', label: 'Lokacija', type: 'text' },
    { name: 'opis', label: 'Opis / opombe', type: 'textarea' },
    {
      name: 'skupine',
      label: 'Skupine udeležencev',
      type: 'select',
      hasMany: true,
      options: VLOGE.map((v) => ({ label: v.label, value: v.value })),
      admin: {
        description: 'Dodaj cele skupine – vse osebe iz izbranih kategorij (npr. vsi člani, vsi mladi demokrati).',
      },
    },
    {
      name: 'udelezenci',
      label: 'Posamezni udeleženci',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: { description: 'Poleg skupin – dodaj točno določene osebe.' },
    },
    {
      name: 'posljiVabilo',
      type: 'ui',
      admin: { components: { Field: '/components/admin/PosljiVabilo#PosljiVabilo' } },
    },
  ],
}
