import type { CollectionConfig } from 'payload'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/ć/g, 'c')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Kandidati za občinski svet (lista). Vsak ima javno podstran.
export const Svetniki: CollectionConfig = {
  slug: 'svetniki',
  labels: { singular: 'Kandidat za svetnika', plural: 'Kandidati za svetnike (lista)' },
  admin: {
    useAsTitle: 'imePriimek',
    defaultColumns: ['imePriimek', 'poklic', 'kraj', 'objavljeno', 'vrstniRed'],
    group: 'Javna vsebina',
    description:
      'Kandidati za občinski svet, prikazani na strani »Lokalne volitve«. Klik na kandidata odpre njegovo podstran s predstavitvijo in obrazcem za sporočilo.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: 'vrstniRed',
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.imePriimek) data.slug = slugify(String(data.imePriimek))
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'imePriimek', label: 'Ime in priimek', type: 'text', required: true, admin: { width: '60%' } },
        { name: 'vrstniRed', label: 'Vrstni red', type: 'number', defaultValue: 100, admin: { width: '20%' } },
        { name: 'objavljeno', label: 'Objavljeno', type: 'checkbox', defaultValue: true, admin: { width: '20%' } },
      ],
    },
    {
      name: 'slug',
      label: 'URL (slug)',
      type: 'text',
      unique: true,
      admin: { description: 'Pusti prazno – samodejno se ustvari iz imena in priimka.' },
    },
    { name: 'fotografija', label: 'Fotografija', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'poklic', label: 'Poklic / funkcija', type: 'text', admin: { width: '50%' } },
        { name: 'kraj', label: 'Kraj', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'kratekOpis', label: 'Kratek opis (za kartico)', type: 'textarea' },
    { name: 'predstavitev', label: 'Predstavitev (na podstrani kandidata)', type: 'textarea' },
    {
      name: 'poudarki',
      label: 'Poudarki / zakaj kandidiram',
      type: 'array',
      labels: { singular: 'Poudarek', plural: 'Poudarki' },
      fields: [{ name: 'besedilo', label: 'Poudarek', type: 'text', required: true }],
    },
    {
      name: 'email',
      label: 'E-naslov kandidata (neobvezno)',
      type: 'email',
      admin: { description: 'Če je vnesen, gredo sporočila z njegove podstrani tudi na ta naslov.' },
    },
  ],
}
