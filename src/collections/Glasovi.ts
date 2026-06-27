import type { CollectionConfig } from 'payload'
import { adminOnly, skritoRazenAdmin } from '../access/roles'
import { GLAS_OPCIJE } from '../lib/seje'

// Revizijski zapis glasov dopisnih sej (kdo, kdaj, kaj). Ustvarja jih sistem ob glasovanju.
export const Glasovi: CollectionConfig = {
  slug: 'glasovi',
  labels: { singular: 'Glas', plural: 'Glasovi (revizija)' },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['seja', 'uporabnik', 'glas', 'glasovanoOb'],
    group: 'Sistem',
    description: 'Evidenca oddanih glasov na dopisnih sejah – samo za vpogled. Glasove oddajo udeleženci v sistemu.',
    hidden: skritoRazenAdmin,
  },
  access: {
    read: adminOnly,
    create: () => false, // samo prek sistemske točke ob glasovanju
    update: () => false,
    delete: adminOnly, // admin lahko izbriše glas (ponovno odpre glasovanje za udeleženca)
  },
  fields: [
    { name: 'seja', label: 'Seja', type: 'relationship', relationTo: 'seje', required: true, admin: { readOnly: true } },
    { name: 'tockaId', label: 'Točka (ID)', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'uporabnik', label: 'Glasoval', type: 'relationship', relationTo: 'users', required: true, admin: { readOnly: true } },
    {
      name: 'glas',
      label: 'Glas',
      type: 'select',
      required: true,
      options: [...GLAS_OPCIJE],
      admin: { readOnly: true },
    },
    { name: 'glasovanoOb', label: 'Glasovano ob', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
