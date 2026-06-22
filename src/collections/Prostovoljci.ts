import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access/roles'

// Prijave za sodelovanje (spec. razdelek 4 – možnost prijave za sodelovanje).
export const Prostovoljci: CollectionConfig = {
  slug: 'prostovoljci',
  labels: { singular: 'Prijava za sodelovanje', plural: 'Prijave za sodelovanje' },
  admin: {
    useAsTitle: 'imePriimek',
    defaultColumns: ['imePriimek', 'email', 'kraj', 'createdAt'],
    group: 'Pobude in sporočila',
    description:
      'Prijave občanov, ki se želijo pridružiti ekipi (oddane na strani »Demokrati Radovljica«). Samo za pregled – vnašajo jih obiskovalci.',
  },
  access: {
    // Prijave oddajo obiskovalci prek javne strani (overrideAccess) – ročno se ne ustvarjajo.
    create: () => false,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
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
    { name: 'kraj', label: 'Kraj', type: 'text' },
    { name: 'podrocja', label: 'Področja zanimanja', type: 'text' },
    { name: 'sporocilo', label: 'Sporočilo', type: 'textarea' },
    { name: 'soglasjeGDPR', label: 'Soglasje za obdelavo osebnih podatkov', type: 'checkbox', required: true },
  ],
}
