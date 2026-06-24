import type { CollectionConfig } from 'payload'
import { adminOrUrednik } from '../access/roles'
import { POBUDA_KATEGORIJE } from '../lib/pobude'
import { ikonaOptions } from '../lib/ikone'
import { slugify } from '../lib/slug'

// Izbor ikon, ki so na voljo administratorju.
const IKONE = [
  'rocket',
  'scale',
  'landmark',
  'route',
  'parking',
  'droplets',
  'home',
  'briefcase',
  'dumbbell',
  'users',
  'heartHandshake',
  'mountain',
  'trees',
  'smartphone',
  'compass',
  'eye',
  'wallet',
  'fileText',
  'mapPin',
]

// Programska področja (spec. razdelek 7) – urejivo v administraciji.
export const ProgramskaPodrocja: CollectionConfig = {
  slug: 'programska-podrocja',
  labels: { singular: 'Programsko področje', plural: 'Programska področja' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'objavljeno', 'vrstniRed'],
    group: 'Javna vsebina',
    description:
      'Področja programa, prikazana na javni strani »Program«. Vsako področje ima svojo podstran (uvod, ukrepi, fotografije). Uredi besedila, vrstni red ali skrij področje (odkljukaj »Objavljeno«).',
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
        { name: 'naslov', label: 'Naslov', type: 'text', required: true, admin: { width: '60%' } },
        {
          name: 'vrstniRed',
          label: 'Vrstni red',
          type: 'number',
          defaultValue: 100,
          admin: { width: '20%', description: 'Manjša številka = višje na seznamu.' },
        },
        {
          name: 'objavljeno',
          label: 'Objavljeno',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '20%', components: { Cell: '/components/admin/DaNeCell#DaNeCell' } },
        },
      ],
    },
    {
      name: 'slug',
      label: 'Spletni naslov (samodejno)',
      type: 'text',
      unique: true,
      admin: {
        description: 'Pusti prazno – ustvari se samodejno iz naslova. (Del povezave do strani.)',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ikona',
          label: 'Ikona',
          type: 'select',
          defaultValue: 'fileText',
          options: ikonaOptions(IKONE),
          admin: { width: '50%', description: 'Sličica ob naslovu področja.' },
        },
        {
          name: 'povezanaKategorija',
          label: 'Povezana kategorija pobud',
          type: 'select',
          options: POBUDA_KATEGORIJE.map((k) => ({ label: k.label, value: k.value })),
          admin: {
            width: '50%',
            description: 'Pobude te kategorije se prikažejo na podstrani področja.',
          },
        },
      ],
    },
    { name: 'kratekOpis', label: 'Kratek opis (za kartico)', type: 'textarea' },
    { name: 'uvod', label: 'Uvodno besedilo', type: 'textarea' },
    {
      name: 'ukrepi',
      label: 'Konkretni ukrepi',
      type: 'array',
      labels: { singular: 'Ukrep', plural: 'Ukrepi' },
      fields: [{ name: 'besedilo', label: 'Ukrep', type: 'text', required: true }],
    },
    {
      name: 'fotografije',
      label: 'Fotografije',
      type: 'array',
      labels: { singular: 'Fotografija', plural: 'Fotografije' },
      fields: [{ name: 'slika', label: 'Slika', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}
