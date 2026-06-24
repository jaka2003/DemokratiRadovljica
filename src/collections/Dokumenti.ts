import type { CollectionConfig } from 'payload'
import { ownerOrAdmin, adminOnly, isAdmin } from '../access/roles'

// Dokumenti kandidatov (spec. razdelek 9 – nalaganje zahtevanih dokumentov).
export const Dokumenti: CollectionConfig = {
  slug: 'dokumenti',
  labels: { singular: 'Dokument', plural: 'Dokumenti' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'kandidat', 'status'],
    group: 'Uporabniki in kandidati',
    description: 'Dokumenti kandidatov (npr. soglasja, potrdila). Kandidat vidi in nalaga samo svoje.',
  },
  access: {
    read: ownerOrAdmin('kandidat'),
    create: ({ req: { user } }) => Boolean(user),
    update: ownerOrAdmin('kandidat'),
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Kandidat lahko ustvarja le svoje dokumente.
        if (operation === 'create' && req.user && !isAdmin(req.user)) {
          return { ...data, kandidat: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'naslov', label: 'Naziv dokumenta', type: 'text', required: true },
    {
      name: 'kandidat',
      label: 'Kandidat',
      type: 'relationship',
      relationTo: 'users',
      access: { update: ({ req: { user } }) => isAdmin(user) },
      admin: {
        // Kandidat tega ne izbira – dokument se samodejno pripiše njemu.
        // Polje vidi le administrator (za dodelitev dokumenta določenemu kandidatu).
        condition: (_data, _sibling, { user }) => isAdmin(user),
        description: 'Komu pripada dokument. Kandidatu se pripiše samodejno.',
      },
    },
    { name: 'datoteka', label: 'Datoteka', type: 'upload', relationTo: 'media' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'oddano',
      options: [
        { label: 'Zahtevano', value: 'zahtevano' },
        { label: 'Oddano', value: 'oddano' },
        { label: 'Potrjeno', value: 'potrjeno' },
        { label: 'Zavrnjeno', value: 'zavrnjeno' },
      ],
    },
    { name: 'opomba', label: 'Opomba', type: 'textarea' },
  ],
}
