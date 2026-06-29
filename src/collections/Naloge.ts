import type { CollectionConfig } from 'payload'
import { ownerOrAdmin, adminOnly, skritoRazenAdmin } from '../access/roles'

// Naloge, dodeljene kandidatom (spec. razdelka 9 in 11).
export const Naloge: CollectionConfig = {
  slug: 'naloge',
  labels: { singular: 'Naloga', plural: 'Naloge' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'kandidat', 'status', 'rok'],
    listSearchableFields: ['naslov', 'opis'],
    group: 'Ljudje in kampanja',
    hidden: skritoRazenAdmin,
    description:
      'Naloge, dodeljene osebam (kandidatom, članom …). Vsak vidi svoje naloge in lahko spremeni status. Skupinsko dodeljevanje: »Dodeli naloge« na nadzorni plošči.',
  },
  access: {
    read: ownerOrAdmin('kandidat'),
    create: adminOnly,
    update: ownerOrAdmin('kandidat'),
    delete: adminOnly,
  },
  fields: [
    { name: 'naslov', label: 'Naloga', type: 'text', required: true },
    { name: 'kandidat', label: 'Dodeljeno osebi', type: 'relationship', relationTo: 'users', required: true },
    { name: 'opis', label: 'Opis', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'odprta',
          options: [
            { label: 'Odprta', value: 'odprta' },
            { label: 'V teku', value: 'v_teku' },
            { label: 'Zaključena', value: 'zakljucena' },
          ],
          admin: { width: '50%' },
        },
        { name: 'rok', label: 'Rok', type: 'date', admin: { width: '50%' } },
      ],
    },
  ],
}
