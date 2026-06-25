import type { CollectionConfig } from 'payload'
import { adminOrUrednik } from '../access/roles'

// Deljive objave za širjenje programa. Urednik pripravi objavo (slika + besedilo), člani in
// kandidati pa jo z enim klikom kopirajo in delijo na družbenih omrežjih. Tako je sporočilo enotno.
export const Objave: CollectionConfig = {
  slug: 'deljive-objave',
  labels: { singular: 'Deljiva objava', plural: 'Deljive objave (za širjenje)' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'platforma', 'objavljeno', 'vrstniRed'],
    group: 'Kampanja',
    defaultSort: 'vrstniRed',
    description:
      'Pripravljene objave za družbena omrežja. Člani in kandidati jih najdejo pod »Deli objave« in z enim klikom kopirajo besedilo, prenesejo sliko ter odprejo Facebook.',
  },
  access: {
    // Vsi prijavljeni (ekipa, člani) vidijo objave prek interne strani; urejajo urednik/admin.
    read: ({ req }) => Boolean(req.user),
    create: adminOrUrednik,
    update: adminOrUrednik,
    delete: adminOrUrednik,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'naslov', label: 'Naslov (interno)', type: 'text', required: true, admin: { width: '60%' } },
        {
          name: 'platforma',
          label: 'Za omrežje',
          type: 'select',
          defaultValue: 'splosno',
          options: [
            { label: 'Splošno', value: 'splosno' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Zgodba (Story)', value: 'story' },
          ],
          admin: { width: '40%' },
        },
      ],
    },
    {
      name: 'slika',
      label: 'Slika za objavo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Slika, ki jo član prenese in priloži objavi.' },
    },
    {
      name: 'besedilo',
      label: 'Besedilo objave',
      type: 'textarea',
      required: true,
      admin: { description: 'Glavno besedilo objave (za Facebook).' },
    },
    {
      name: 'besediloKratko',
      label: 'Kratko besedilo (neobvezno)',
      type: 'textarea',
      admin: { description: 'Krajša različica za zgodbe ali hiter delež.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'povezava',
          label: 'Povezava',
          type: 'text',
          admin: { width: '60%', description: 'Npr. povezava do programa ali novice. Če prazno, se uporabi spletna stran.' },
        },
        { name: 'hashtagi', label: 'Hashtagi', type: 'text', admin: { width: '40%', description: 'Npr. #Radovljica #Demokrati' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'objavljeno',
          label: 'Objavljeno (vidno članom)',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%', components: { Cell: '/components/admin/DaNeCell#DaNeCell' } },
        },
        {
          name: 'vrstniRed',
          label: 'Vrstni red',
          type: 'number',
          defaultValue: 100,
          admin: { width: '50%', description: 'Manjša številka = višje.' },
        },
      ],
    },
  ],
}
