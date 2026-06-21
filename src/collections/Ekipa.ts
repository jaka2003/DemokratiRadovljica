import type { CollectionConfig } from 'payload'

// Člani lokalne ekipe Demokrati Radovljica (spec. razdelek 4).
export const Ekipa: CollectionConfig = {
  slug: 'ekipa',
  labels: { singular: 'Član ekipe', plural: 'Ekipa' },
  admin: {
    useAsTitle: 'ime',
    defaultColumns: ['ime', 'funkcija', 'objavljeno', 'vrstniRed'],
    group: 'Javna vsebina',
    description:
      'Člani lokalne ekipe, prikazani na strani »Demokrati Radovljica«. Dodaj osebo, naloži fotografijo in vpiši funkcijo.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: 'vrstniRed',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'ime', label: 'Ime in priimek', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'funkcija', label: 'Funkcija / vloga', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'fotografija', label: 'Fotografija', type: 'upload', relationTo: 'media' },
    { name: 'opis', label: 'Kratka predstavitev', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'vrstniRed', label: 'Vrstni red', type: 'number', defaultValue: 100, admin: { width: '50%' } },
        { name: 'objavljeno', label: 'Objavljeno', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
      ],
    },
  ],
}
