import type { CollectionConfig } from 'payload'
import { adminOrUrednik } from '../access/roles'

// Člani lokalne ekipe Demokrati Radovljica (spec. razdelek 4).
export const Ekipa: CollectionConfig = {
  slug: 'ekipa',
  labels: { singular: 'Član ekipe', plural: 'Ekipa' },
  admin: {
    useAsTitle: 'ime',
    defaultColumns: ['ime', 'funkcija', 'objavljeno', 'vrstniRed'],
    group: 'Javna vsebina',
    description:
      'Člani lokalne ekipe, prikazani na strani »Demokrati Radovljica«. Dodaj osebo, naloži fotografijo in vpiši funkcijo.',
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
      async ({ req, data }) => {
        if (data?.uporabnik) {
          try {
            const u = (await req.payload.findByID({
              collection: 'users',
              id: data.uporabnik as string,
              depth: 0,
            })) as Record<string, unknown>
            if (u) {
              data.ime ||= u.ime
              data.fotografija ||= u.fotografija
              data.funkcija ||= u.aiPoklic
              data.opis ||= u.opis || u.politicnaPredstavitev
            }
          } catch {
            /* neusodno */
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'uporabnik',
      label: 'Izberi iz uporabnikov / kandidatov',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description:
          'Neobvezno: izberi osebo, da se ime, fotografija in opis samodejno izpolnijo (lahko jih urediš). Funkcijo vneseš ročno.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'ime', label: 'Ime in priimek', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'funkcija', label: 'Funkcija / vloga', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'fotografija', label: 'Fotografija', type: 'upload', relationTo: 'media' },
    { name: 'opis', label: 'Kratka predstavitev', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'vrstniRed', label: 'Vrstni red', type: 'number', defaultValue: 100, admin: { width: '50%' } },
        { name: 'objavljeno', label: 'Objavljeno', type: 'checkbox', defaultValue: true, admin: { width: '50%' } },
      ],
    },
  ],
}
