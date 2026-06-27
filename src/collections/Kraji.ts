import type { CollectionConfig } from 'payload'
import { adminOrUrednik, skritoRazenUrednik } from '../access/roles'
import { slugify } from '../lib/slug'

// Kraji občine Radovljica (spec. razdelek 5) – urejivo v administraciji.
export const Kraji: CollectionConfig = {
  slug: 'kraji',
  labels: { singular: 'Kraj', plural: 'Kraji' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'objavljeno', 'vrstniRed'],
    group: 'Vsebina strani',
    hidden: skritoRazenUrednik,
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
        { name: 'naslov', label: 'Ime kraja', type: 'text', required: true, admin: { width: '60%' } },
        { name: 'vrstniRed', label: 'Vrstni red', type: 'number', defaultValue: 100, admin: { width: '20%', description: 'Manjša številka = višje na seznamu.' } },
        { name: 'objavljeno', label: 'Objavljeno', type: 'checkbox', defaultValue: true, admin: { width: '20%', components: { Cell: '/components/admin/DaNeCell#DaNeCell' } } },
      ],
    },
    {
      name: 'slug',
      label: 'Spletni naslov (samodejno)',
      type: 'text',
      unique: true,
      admin: {
        description: 'Pusti prazno – ustvari se samodejno iz imena kraja. (Del povezave do podstrani.)',
      },
    },
    { name: 'opis', label: 'Kratek opis', type: 'textarea' },
    { name: 'naslovnaFotografija', label: 'Naslovna fotografija', type: 'upload', relationTo: 'media' },
    {
      type: 'collapsible',
      label: 'Lega na zemljevidu (neobvezno)',
      admin: {
        initCollapsed: true,
        description: 'Koordinati za prikaz kraja na zemljevidu. Spreminjaj le, če veš, kaj počneš.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'lat', label: 'Zemljepisna širina (lat)', type: 'number', admin: { width: '50%' } },
            { name: 'lng', label: 'Zemljepisna dolžina (lng)', type: 'number', admin: { width: '50%' } },
          ],
        },
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
