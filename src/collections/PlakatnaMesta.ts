import type { CollectionConfig } from 'payload'
import { adminOnly, adminFieldOnly, ownerOrAdmin, skritoRazenUrednik } from '../access/roles'
import { KRAJI } from '../lib/pobude'

export const PLAKAT_STATUSI = [
  { label: 'Predlagano', value: 'predlagano' },
  { label: 'Potrjeno', value: 'potrjeno' },
  { label: 'Zavrnjeno', value: 'zavrnjeno' },
  { label: 'Postavljeno', value: 'postavljeno' },
] as const

// Predlogi lokacij za plakate – oddajo prijavljeni (kandidati/člani) prek interne strani
// /interno/plakat (zemljevid + fotografija). Admin jih pregleda in nastavi status.
export const PlakatnaMesta: CollectionConfig = {
  slug: 'plakatna-mesta',
  labels: { singular: 'Plakatno mesto', plural: 'Plakatna mesta' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'kraj', 'status', 'predlagatelj', 'createdAt'],
    group: 'Obravnava',
    hidden: skritoRazenUrednik,
    description:
      'Predlogi lokacij za plakate, ki jih prijavljeni (kandidati/člani) oddajo na interni strani »Predlagaj plakatno mesto«. Tukaj jih pregleduješ, si ogledaš lokacijo in fotografije ter nastaviš status.',
  },
  access: {
    // Predlagatelj vidi in ureja svoje, administrator vse. Ustvarja se prek interne strani.
    read: ownerOrAdmin('predlagatelj'),
    create: adminOnly,
    update: ownerOrAdmin('predlagatelj'),
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user && !data?.predlagatelj) {
          return { ...data, predlagatelj: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'naslov', label: 'Kratek opis lokacije', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'kraj',
          label: 'Kraj',
          type: 'select',
          options: KRAJI.map((k) => ({ label: k, value: k })),
          admin: { width: '50%' },
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'predlagano',
          options: [...PLAKAT_STATUSI],
          access: { update: adminFieldOnly },
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'opis', label: 'Zakaj je primerno (neobvezno)', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'lat', label: 'Zemljepisna širina (lat)', type: 'number', admin: { width: '50%' } },
        { name: 'lng', label: 'Zemljepisna dolžina (lng)', type: 'number', admin: { width: '50%' } },
      ],
    },
    {
      name: 'foto',
      label: 'Fotografije',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 4,
      admin: { description: 'Do 4 fotografije predlagane lokacije.' },
    },
    {
      name: 'predlagatelj',
      label: 'Predlagatelj',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, description: 'Samodejno – kdor je oddal predlog.' },
    },
    {
      name: 'notranjeOpombe',
      label: 'Notranje opombe',
      type: 'textarea',
      access: { update: adminFieldOnly },
    },
  ],
}
