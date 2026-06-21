import type { CollectionConfig } from 'payload'
import { POBUDA_KATEGORIJE } from '../lib/pobude'

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
    defaultColumns: ['naslov', 'slug', 'objavljeno', 'vrstniRed'],
    group: 'Javna vsebina',
    description:
      'Področja programa, prikazana na javni strani »Program«. Vsako področje ima svojo podstran (uvod, ukrepi, fotografije). Uredi besedila, vrstni red ali skrij področje (odkljukaj »Objavljeno«).',
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
        { name: 'naslov', label: 'Naslov', type: 'text', required: true, admin: { width: '60%' } },
        {
          name: 'vrstniRed',
          label: 'Vrstni red',
          type: 'number',
          defaultValue: 100,
          admin: { width: '20%' },
        },
        {
          name: 'objavljeno',
          label: 'Objavljeno',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '20%' },
        },
      ],
    },
    {
      name: 'slug',
      label: 'URL (slug)',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Naslov v povezavi, npr. "promet-in-plocniki". Brez šumnikov in presledkov.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ikona',
          label: 'Ikona',
          type: 'select',
          defaultValue: 'fileText',
          options: IKONE.map((i) => ({ label: i, value: i })),
          admin: { width: '50%' },
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
