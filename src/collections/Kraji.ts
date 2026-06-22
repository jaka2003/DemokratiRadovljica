import type { CollectionConfig } from 'payload'
import { adminOrUrednik } from '../access/roles'

// Kraji občine Radovljica (spec. razdelek 5) – urejivo v administraciji.
export const Kraji: CollectionConfig = {
  slug: 'kraji',
  labels: { singular: 'Kraj', plural: 'Kraji' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'slug', 'objavljeno', 'vrstniRed'],
    group: 'Javna vsebina',
    description:
      'Kraji občine, prikazani na strani »Občina« in na zemljevidu. Vsak kraj ima svojo podstran z opisom, fotografijo, temami in pobudami iz tega kraja.',
  },
  access: {
    read: () => true,
    create: adminOrUrednik,
    update: adminOrUrednik,
    delete: adminOrUrednik,
  },
  defaultSort: 'vrstniRed',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'naslov', label: 'Ime kraja', type: 'text', required: true, admin: { width: '60%' } },
        { name: 'vrstniRed', label: 'Vrstni red', type: 'number', defaultValue: 100, admin: { width: '20%' } },
        { name: 'objavljeno', label: 'Objavljeno', type: 'checkbox', defaultValue: true, admin: { width: '20%' } },
      ],
    },
    {
      name: 'slug',
      label: 'URL (slug)',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Naslov v povezavi, npr. "begunje-na-gorenjskem". Brez šumnikov in presledkov.' },
    },
    { name: 'opis', label: 'Kratek opis', type: 'textarea' },
    { name: 'naslovnaFotografija', label: 'Naslovna fotografija', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'lat', label: 'Lat', type: 'number', admin: { width: '50%' } },
        { name: 'lng', label: 'Lng', type: 'number', admin: { width: '50%' } },
      ],
    },
    {
      name: 'aktualneTeme',
      label: 'Aktualne teme',
      type: 'array',
      labels: { singular: 'Tema', plural: 'Teme' },
      fields: [{ name: 'besedilo', label: 'Tema', type: 'text', required: true }],
    },
    {
      name: 'projekti',
      label: 'Projekti / programske usmeritve',
      type: 'array',
      labels: { singular: 'Projekt', plural: 'Projekti' },
      fields: [{ name: 'besedilo', label: 'Projekt', type: 'text', required: true }],
    },
  ],
}
