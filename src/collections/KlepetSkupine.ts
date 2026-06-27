import type { CollectionConfig } from 'payload'
import { adminOnly, VLOGE, skritoRazenAdmin } from '../access/roles'

// Lastne (custom) skupine za klepet ekipe. Administrator jih ustvarja v adminu in določi člane
// (po vlogah in/ali poimensko). Pojavijo se kot sobe v »Klepet ekipe«. Sporočila se hranijo v
// zbirki »Sporocila« s ključem soba = »db:<id>«.
export const KlepetSkupine: CollectionConfig = {
  slug: 'klepet-skupine',
  labels: { singular: 'Skupina klepeta', plural: 'Skupine klepeta' },
  admin: {
    useAsTitle: 'naziv',
    defaultColumns: ['naziv', 'ikona', 'vsiClani', 'objavljeno'],
    group: 'Sistem',
    hidden: skritoRazenAdmin,
    description:
      'Lastne skupine (sobe) za klepet ekipe. Določi člane po vlogah in/ali poimensko – skupina se prikaže v »Klepet ekipe«.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    // Ob izbrisu skupine pobrišemo še njena sporočila.
    beforeDelete: [
      async ({ req, id }) => {
        try {
          await req.payload.delete({
            collection: 'sporocila',
            where: { soba: { equals: `db:${id}` } },
            overrideAccess: true,
          })
        } catch (e) {
          console.error('Napaka pri brisanju sporočil skupine:', e)
        }
      },
    ],
  },
  fields: [
    { name: 'naziv', label: 'Ime skupine', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'ikona',
          label: 'Ikona (emoji)',
          type: 'text',
          defaultValue: '#️⃣',
          admin: { width: '50%', description: 'Npr. 📋, 🎯, 🍻 …' },
        },
        {
          name: 'objavljeno',
          label: 'Aktivna',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '50%',
            description: 'Odkljukaj za skritje skupine iz klepeta.',
            components: { Cell: '/components/admin/DaNeCell#DaNeCell' },
          },
        },
      ],
    },
    { name: 'opis', label: 'Kratek opis', type: 'text' },
    {
      name: 'vsiClani',
      label: 'Dostopno vsem prijavljenim',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Če je obkljukano, skupino vidijo vsi uporabniki sistema (ne glede na vlogo).',
        components: { Cell: '/components/admin/DaNeCell#DaNeCell' },
      },
    },
    {
      name: 'vloge',
      label: 'Člani po vlogah',
      type: 'select',
      hasMany: true,
      options: VLOGE.map((v) => ({ label: v.label, value: v.value })),
      admin: { description: 'Vse osebe iz izbranih vlog so člani te skupine.' },
    },
    {
      name: 'clani',
      label: 'Poimenski člani',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: { description: 'Dodatne posamezne osebe (poleg vlog).' },
    },
  ],
}
