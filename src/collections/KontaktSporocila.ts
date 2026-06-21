import type { CollectionConfig } from 'payload'

// Sporočila iz kontaktnih obrazcev (kandidat, splošni kontakt).
export const KontaktSporocila: CollectionConfig = {
  slug: 'kontakt-sporocila',
  labels: { singular: 'Kontaktno sporočilo', plural: 'Kontaktna sporočila' },
  admin: {
    useAsTitle: 'imePriimek',
    defaultColumns: ['imePriimek', 'email', 'vir', 'createdAt'],
    group: 'Pobude in sporočila',
    description:
      'Sporočila iz kontaktnih obrazcev (npr. s strani kandidata). Samo za pregled – vnašajo jih obiskovalci.',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'imePriimek', label: 'Ime in priimek', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'email', label: 'E-pošta', type: 'email', required: true, admin: { width: '50%' } },
        { name: 'telefon', label: 'Telefon', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'sporocilo', label: 'Sporočilo', type: 'textarea', required: true },
    {
      name: 'vir',
      label: 'Vir',
      type: 'select',
      defaultValue: 'kandidat',
      options: [
        { label: 'Stran kandidata', value: 'kandidat' },
        { label: 'Splošni kontakt', value: 'splosno' },
      ],
    },
    { name: 'soglasjeGDPR', label: 'Soglasje GDPR', type: 'checkbox' },
  ],
}
