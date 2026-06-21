import type { GlobalConfig } from 'payload'
import { splitToList } from '../lib/prefill'

// Javna stran kandidata/-ke za župana/-jo (spec. razdelek 6).
// Objavi se, ko je kandidat uradno predstavljen.
export const Kandidat: GlobalConfig = {
  slug: 'kandidat',
  label: 'Kandidat za župana (javna stran)',
  admin: {
    group: 'Javna vsebina',
    description:
      'Podatki kandidata za župana – prikažejo se na strani »Lokalne volitve« (zgornji blok) in na podstrani /lokalne-volitve/zupan. Dokler ni odkljukano »Objavi«, je kandidat skrit. Listo kandidatov za svetnike urejaš v rubriki »Kandidati za svetnike«.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
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
              data.imePriimek ||= u.ime
              data.fotografija ||= u.fotografija
              data.kontaktEmail ||= u.osebniEmail || u.email
              data.nagovor ||= u.genKratkaPredstavitev || u.politicnaPredstavitev || u.opis
              data.izkusnje ||= u.aiIzkusnje
              data.pogledNaRazvoj ||= u.aiLokalneTeme || u.aiRazlog
              // Vrednote iz osebnih vrednot (če še ni vneseno).
              if (!Array.isArray(data.vrednote) || data.vrednote.length === 0) {
                const list = splitToList(u.aiVrednote)
                if (list.length) data.vrednote = list.map((label) => ({ label, ikona: 'shieldCheck' }))
              }
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
          'Neobvezno: izberi osebo, da se ime, fotografija, nagovor in izkušnje samodejno izpolnijo (lahko jih urediš).',
      },
    },
    {
      name: 'objavljeno',
      label: 'Objavi stran kandidata',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Dokler ni obkljukano, stran prikazuje napoved "kmalu".' },
    },
    {
      type: 'row',
      fields: [
        { name: 'imePriimek', label: 'Ime in priimek', type: 'text', admin: { width: '60%' } },
        { name: 'kontaktEmail', label: 'Kontaktni e-naslov', type: 'email', admin: { width: '40%' } },
      ],
    },
    { name: 'fotografija', label: 'Fotografija', type: 'upload', relationTo: 'media' },
    { name: 'nagovor', label: 'Uvodni nagovor', type: 'textarea' },
    { name: 'izkusnje', label: 'Predstavitev izkušenj', type: 'textarea' },
    { name: 'pogledNaRazvoj', label: 'Pogled na razvoj občine', type: 'textarea' },
    {
      name: 'vrednote',
      label: 'Glavne vrednote',
      type: 'array',
      labels: { singular: 'Vrednota', plural: 'Vrednote' },
      fields: [
        { name: 'label', label: 'Naziv', type: 'text', required: true },
        {
          name: 'ikona',
          label: 'Ikona',
          type: 'select',
          defaultValue: 'shieldCheck',
          options: ['users', 'rocket', 'eye', 'shieldCheck', 'heartHandshake', 'scale', 'flag', 'compass'].map((i) => ({
            label: i,
            value: i,
          })),
        },
      ],
    },
    {
      name: 'videoUrl',
      label: 'Video nagovor (povezava YouTube/Vimeo)',
      type: 'text',
      admin: { description: 'Npr. https://www.youtube.com/watch?v=...' },
    },
  ],
}
