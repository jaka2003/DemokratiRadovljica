import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access/roles'
import { desifriraj, sifriraj } from '../lib/sifriranje'

// Sporočila internega klepeta ekipe (sobe + zasebno). Ustvarjajo se prek interne strani
// »/interno/klepet« (z avtorizacijo glede na dostop do sobe / pogovora). V adminu jih
// administrator lahko le pregleda ali izbriše (moderacija).
export const Sporocila: CollectionConfig = {
  slug: 'sporocila',
  labels: { singular: 'Sporočilo', plural: 'Sporočila (klepet)' },
  admin: {
    useAsTitle: 'besedilo',
    defaultColumns: ['avtor', 'vrsta', 'soba', 'besedilo', 'createdAt'],
    group: 'Kampanja',
    description:
      'Sporočila internega klepeta ekipe. Tu jih administrator lahko pregleda ali izbriše (moderacija). Pišejo se v sistemu na strani »Klepet ekipe«.',
  },
  access: {
    read: adminOnly,
    create: () => false, // samo prek interne strani (preverjanje dostopa do sobe/pogovora)
    update: () => false,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'vrsta',
      label: 'Vrsta',
      type: 'select',
      required: true,
      defaultValue: 'soba',
      options: [
        { label: 'Soba', value: 'soba' },
        { label: 'Zasebno', value: 'zasebno' },
      ],
      admin: { readOnly: true },
    },
    { name: 'soba', label: 'Soba (ključ)', type: 'text', index: true, admin: { readOnly: true } },
    {
      name: 'avtor',
      label: 'Avtor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'prejemnik',
      label: 'Prejemnik (zasebno)',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    { name: 'pogovor', label: 'Ključ pogovora', type: 'text', index: true, admin: { readOnly: true } },
    {
      name: 'besedilo',
      label: 'Besedilo',
      type: 'textarea',
      required: true,
      admin: { readOnly: true },
      // Šifriranje v bazi: shranimo zašifrirano, ob branju (tudi v adminu za moderacijo) dešifriramo.
      hooks: {
        beforeChange: [({ value }) => (typeof value === 'string' ? sifriraj(value) : value)],
        afterRead: [({ value }) => (typeof value === 'string' ? desifriraj(value) : value)],
      },
    },
  ],
}
