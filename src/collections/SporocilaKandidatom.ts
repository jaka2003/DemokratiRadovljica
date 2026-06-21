import type { CollectionConfig } from 'payload'
import { ownerOrAdmin, adminOnly } from '../access/roles'

// Sporočila administratorja kandidatom (spec. razdelek 9 – pregled sporočil administratorja).
export const SporocilaKandidatom: CollectionConfig = {
  slug: 'sporocila-kandidatom',
  labels: { singular: 'Sporočilo kandidatu', plural: 'Sporočila kandidatom' },
  admin: {
    useAsTitle: 'zadeva',
    defaultColumns: ['zadeva', 'kandidat', 'createdAt'],
    group: 'Kandidati',
    description: 'Sporočila, ki jih administrator pošlje posameznemu kandidatu (kandidat jih vidi v svojem pregledu).',
  },
  access: {
    read: ownerOrAdmin('kandidat'),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'zadeva', label: 'Zadeva', type: 'text', required: true },
    { name: 'kandidat', label: 'Kandidat', type: 'relationship', relationTo: 'users', required: true },
    { name: 'besedilo', label: 'Sporočilo', type: 'textarea', required: true },
  ],
}
