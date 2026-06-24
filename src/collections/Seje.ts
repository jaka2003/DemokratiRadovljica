import type { CollectionConfig } from 'payload'
import { adminOnly, VLOGE } from '../access/roles'
import { SEJA_STATUSI } from '../lib/seje'

// Dopisne (korespondenčne) seje z elektronskim glasovanjem.
export const Seje: CollectionConfig = {
  slug: 'seje',
  labels: { singular: 'Dopisna seja', plural: 'Dopisne seje' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'stevilka', 'status', 'rokGlasovanja'],
    group: 'Kampanja',
    description:
      'Dopisne (korespondenčne) seje z elektronskim glasovanjem. Ustvari sejo, dodaj točke in udeležence, pošlji vabilo ter spremljaj rezultate.',
  },
  access: {
    // Udeleženci do sej dostopajo prek interne strani (overrideAccess); v adminu jih ureja le administrator.
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Osnovno',
          fields: [
            { name: 'naslov', label: 'Naslov seje', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'stevilka',
                  label: 'Številka / oznaka seje',
                  type: 'text',
                  admin: { width: '50%', description: 'Npr. »1. korespondenčna seja«.' },
                },
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  defaultValue: 'osnutek',
                  options: [...SEJA_STATUSI],
                  admin: {
                    width: '50%',
                    description: 'Samodejno: »V teku« ob pošiljanju, »Zaključena« ko vsi glasujejo ali poteče rok.',
                  },
                },
              ],
            },
            { name: 'opis', label: 'Opis / uvodno besedilo seje', type: 'textarea' },
            {
              type: 'row',
              fields: [
                {
                  name: 'zacetek',
                  label: 'Začetek seje',
                  type: 'date',
                  admin: { width: '50%', date: { pickerAppearance: 'dayAndTime', displayFormat: 'd. M. yyyy, HH:mm' } },
                },
                {
                  name: 'rokGlasovanja',
                  label: 'Rok za glasovanje',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime', displayFormat: 'd. M. yyyy, HH:mm' },
                    description: 'Po tem roku se glasovanje samodejno zaključi.',
                  },
                },
              ],
            },
            {
              name: 'gradivo',
              label: 'Gradivo seje (priloge)',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Skupno gradivo, ki velja za celotno sejo (priloži se tudi v e-pošto).' },
            },
          ],
        },
        {
          label: 'Točke dnevnega reda',
          fields: [
            {
              name: 'tocke',
              label: 'Točke dnevnega reda',
              labels: { singular: 'Točka', plural: 'Točke' },
              type: 'array',
              admin: { description: 'O vsaki točki se glasuje ločeno (ZA / PROTI / VZDRŽAN).' },
              fields: [
                { name: 'naslov', label: 'Naslov točke', type: 'text', required: true },
                { name: 'opis', label: 'Opis / predlog sklepa', type: 'textarea' },
                { name: 'gradivo', label: 'Gradivo (besedilo)', type: 'textarea' },
                { name: 'priloge', label: 'Priloge', type: 'upload', relationTo: 'media', hasMany: true },
                { name: 'dodatniDokumenti', label: 'Dodatni dokumenti', type: 'upload', relationTo: 'media', hasMany: true },
              ],
            },
          ],
        },
        {
          label: 'Udeleženci',
          description: 'Kdo prejme vabilo in lahko glasuje.',
          fields: [
            {
              name: 'skupine',
              label: 'Skupine udeležencev',
              type: 'select',
              hasMany: true,
              options: VLOGE.map((v) => ({ label: v.label, value: v.value })),
              admin: { description: 'Dodaj cele skupine – vse osebe iz izbranih kategorij (npr. vsi člani).' },
            },
            {
              name: 'udelezenci',
              label: 'Posamezni udeleženci',
              type: 'relationship',
              relationTo: 'users',
              hasMany: true,
              admin: { description: 'Poleg skupin – dodaj točno določene osebe.' },
            },
          ],
        },
        {
          label: 'Vabilo (e-pošta)',
          description: 'Besedilo vabila, ki ga prejmejo udeleženci. Vse je uredljivo – nič ni fiksno.',
          fields: [
            { name: 'emailZadeva', label: 'Zadeva e-pošte', type: 'text', defaultValue: 'Sklic dopisne seje' },
            { name: 'emailPosiljatelj', label: 'Ime pošiljatelja', type: 'text', defaultValue: 'Demokrati Radovljica' },
            { name: 'emailUvod', label: 'Nagovor (uvod)', type: 'text', defaultValue: 'Spoštovani,' },
            {
              name: 'emailGlavno',
              label: 'Glavno sporočilo',
              type: 'textarea',
              defaultValue:
                'sklicujem dopisno (korespondenčno) sejo. Gradivo in točke dnevnega reda so na voljo v sistemu. Prosimo, oddajte svoj glas do navedenega roka.',
            },
            {
              name: 'emailZakljucek',
              label: 'Zaključno besedilo',
              type: 'textarea',
              defaultValue: 'O izidu glasovanja boste obveščeni po zaključku seje. Lepo vas pozdravljam.',
            },
            {
              name: 'emailPodpis',
              label: 'Podpis',
              type: 'text',
              admin: { description: 'Npr. »Žiga Erman, predsednik OO Radovljica«.' },
            },
            {
              name: 'posiljanje',
              type: 'ui',
              admin: { components: { Field: '/components/admin/SejaPosiljanje#SejaPosiljanje' } },
            },
          ],
        },
        {
          label: 'Rezultati',
          fields: [
            {
              name: 'rezultati',
              type: 'ui',
              admin: { components: { Field: '/components/admin/SejaRezultati#SejaRezultati' } },
            },
          ],
        },
      ],
    },
    { name: 'poslanoOb', type: 'date', admin: { hidden: true } },
    { name: 'zakljucenoOb', type: 'date', admin: { hidden: true } },
  ],
}
