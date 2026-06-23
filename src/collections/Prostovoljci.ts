import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access/roles'

// Prijave za sodelovanje (spec. razdelek 4 – možnost prijave za sodelovanje).
export const Prostovoljci: CollectionConfig = {
  slug: 'prostovoljci',
  labels: { singular: 'Prijava za sodelovanje', plural: 'Prijave za sodelovanje' },
  admin: {
    useAsTitle: 'imePriimek',
    defaultColumns: ['imePriimek', 'email', 'kraj', 'status', 'createdAt'],
    group: 'Pobude in sporočila',
    description:
      'Prijave občanov, ki se želijo pridružiti ekipi (oddane na strani »Demokrati Radovljica«). Vsebino vnašajo obiskovalci; ti nastaviš »Status«, da sledite obravnavi.',
  },
  access: {
    // Prijave oddajo obiskovalci prek javne strani (overrideAccess) – ročno se ne ustvarjajo.
    create: () => false,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Status (obravnava)',
          type: 'select',
          defaultValue: 'novo',
          options: [
            { label: 'Novo', value: 'novo' },
            { label: 'V obravnavi', value: 'v_obravnavi' },
            { label: 'Kontaktiran', value: 'kontaktiran' },
            { label: 'Zaključeno', value: 'zakljuceno' },
          ],
          admin: { width: '50%', description: 'Sledi, kako daleč je obravnava prijave.' },
        },
      ],
    },
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
    { name: 'notranjeOpombe', label: 'Notranje opombe', type: 'textarea', admin: { description: 'Za interno sledenje (npr. kdaj kontaktiran, dogovor).' } },
    { name: 'soglasjeGDPR', label: 'Soglasje za obdelavo osebnih podatkov', type: 'checkbox', required: true },
  ],
}
