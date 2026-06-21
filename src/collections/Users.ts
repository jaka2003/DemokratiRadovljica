import type { CollectionConfig } from 'payload'
import { adminOrSelf, adminOnly, adminFieldOnly, isAdmin } from '../access/roles'

// Uporabniške vloge (spec. razdelek 8).
export const ROLES = [
  { label: 'Administrator', value: 'administrator' },
  { label: 'Koordinator kampanje', value: 'koordinator' },
  { label: 'Urednik vsebin', value: 'urednik' },
  { label: 'Kandidat', value: 'kandidat' },
] as const

const IKONE = ['users', 'rocket', 'eye', 'shieldCheck', 'heartHandshake', 'scale', 'flag', 'compass']

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Uporabnik / kandidat', plural: 'Uporabniki in kandidati' },
  auth: true,
  admin: {
    useAsTitle: 'ime',
    defaultColumns: ['ime', 'email', 'vloga', 'statusProfila', 'javnoPrikazan'],
    group: 'Kandidati',
    description:
      'Vsi uporabniki sistema in kandidati. Tukaj dodaš kandidata, mu določiš vlogo in pregleduješ profil. Kandidat se prijavi z e-pošto in geslom ter ureja samo svoj profil. Statusna polja (zavihek »Status«) ureja le administrator.',
  },
  access: {
    read: adminOrSelf,
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
    // Vsi prijavljeni lahko dostopajo do admin panela (kandidat ureja svoj profil).
    admin: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        // Prvi ustvarjeni uporabnik je samodejno administrator.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users' })
          if (totalDocs === 0) return { ...data, vloga: 'administrator' }
        }
        return data
      },
    ],
    // Deaktiviran uporabnik se ne more prijaviti.
    beforeLogin: [
      ({ user }) => {
        if (user && (user as { aktiven?: boolean }).aktiven === false) {
          throw new Error('Račun je deaktiviran. Obrnite se na administratorja kampanje.')
        }
      },
    ],
    // Zabeleži čas zadnje prijave (posebej, ZUNAJ prijavne transakcije,
    // da ne pride do zaklepa vrstice na PostgreSQL).
    afterLogin: [
      ({ req, user }) => {
        setTimeout(() => {
          req.payload
            .update({
              collection: 'users',
              id: user.id,
              data: { zadnjaPrijava: new Date().toISOString() },
              overrideAccess: true,
            })
            .catch(() => {
              /* neusodno */
            })
        }, 100)
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profil',
          description: 'Osnovni podatki kandidata – te lahko ureja kandidat sam.',
          fields: [
            { name: 'ime', label: 'Ime in priimek', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'datumRojstva', label: 'Datum rojstva', type: 'date', admin: { width: '50%' } },
                { name: 'naslovKraj', label: 'Naslov / kraj', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'telefon', label: 'Telefon', type: 'text', admin: { width: '50%' } },
                { name: 'osebniEmail', label: 'Osebni e-naslov', type: 'email', admin: { width: '50%' } },
              ],
            },
            {
              name: 'zeleniSluzbeniEmail',
              label: 'Želeni službeni e-naslov na domeni',
              type: 'text',
              admin: { description: 'Npr. ime.priimek@demokratiradovljica.com – administrator ga potrdi.' },
            },
            { name: 'fotografija', label: 'Fotografija', type: 'upload', relationTo: 'media' },
            { name: 'zivljenjepis', label: 'Življenjepis (dokument)', type: 'upload', relationTo: 'media' },
            { name: 'opis', label: 'Kratka predstavitev', type: 'textarea' },
            { name: 'podrocjaSodelovanja', label: 'Področja sodelovanja', type: 'text' },
            { name: 'politicnaPredstavitev', label: 'Kratka politična / lokalna predstavitev', type: 'textarea' },
            {
              name: 'seznamDokumentov',
              type: 'ui',
              admin: { components: { Field: '/components/admin/PotrebniDokumenti#PotrebniDokumenti' } },
            },
          ],
        },
        {
          label: 'AI predstavitev',
          description: 'Vnesi osnovne podatke in generiraj predloge besedil (jih lahko urediš).',
          fields: [
            { name: 'aiPoklic', label: 'Poklic', type: 'text' },
            { name: 'aiIzkusnje', label: 'Izkušnje', type: 'textarea' },
            { name: 'aiPodrocja', label: 'Področja zanimanja', type: 'text' },
            { name: 'aiLokalneTeme', label: 'Lokalne teme', type: 'textarea' },
            { name: 'aiRazlog', label: 'Razlog kandidature', type: 'textarea' },
            { name: 'aiVrednote', label: 'Osebne vrednote', type: 'text' },
            { name: 'aiSporocila', label: 'Glavna sporočila', type: 'textarea' },
            {
              name: 'aiGenerator',
              type: 'ui',
              admin: { components: { Field: '/components/admin/AiGenerator#AiGenerator' } },
            },
            { name: 'genKratkaPredstavitev', label: 'Kratka predstavitev', type: 'textarea' },
            { name: 'genDaljsaPredstavitev', label: 'Daljša predstavitev', type: 'textarea' },
            { name: 'genSpletna', label: 'Besedilo za spletno stran', type: 'textarea' },
            { name: 'genFacebook', label: 'Besedilo za Facebook objavo', type: 'textarea' },
            { name: 'genBiografija', label: 'Kratka biografija', type: 'textarea' },
            { name: 'genOdgovoriObcanom', label: 'Osnutek odgovorov na vprašanja občanov', type: 'textarea' },
            { name: 'genVideoNagovor', label: 'Osnutek nagovora za video', type: 'textarea' },
          ],
        },
        {
          label: 'Status (interno)',
          fields: [
            {
              name: 'vloga',
              label: 'Vloga',
              type: 'select',
              required: true,
              defaultValue: 'kandidat',
              options: [...ROLES],
              access: { update: adminFieldOnly },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'statusProfila',
                  label: 'Status profila',
                  type: 'select',
                  defaultValue: 'osnutek',
                  options: [
                    { label: 'Osnutek', value: 'osnutek' },
                    { label: 'Oddan v pregled', value: 'oddan' },
                    { label: 'V pregledu', value: 'v_pregledu' },
                    { label: 'Potrjen', value: 'potrjen' },
                    { label: 'Zavrnjen', value: 'zavrnjen' },
                  ],
                  access: { update: adminFieldOnly },
                  admin: { width: '50%' },
                },
                {
                  name: 'statusDokumentacije',
                  label: 'Status dokumentacije',
                  type: 'select',
                  defaultValue: 'ni_oddano',
                  options: [
                    { label: 'Ni oddano', value: 'ni_oddano' },
                    { label: 'Delno', value: 'delno' },
                    { label: 'Popolno', value: 'popolno' },
                  ],
                  access: { update: adminFieldOnly },
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sluzbeniEmailPotrjen',
                  label: 'Potrjen službeni e-naslov',
                  type: 'text',
                  access: { update: adminFieldOnly },
                  admin: { width: '50%' },
                },
                {
                  name: 'javnoPrikazan',
                  label: 'Javno prikazan',
                  type: 'checkbox',
                  defaultValue: false,
                  access: { update: adminFieldOnly },
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'aktiven',
                  label: 'Aktiven račun',
                  type: 'checkbox',
                  defaultValue: true,
                  access: { update: adminFieldOnly },
                  admin: { width: '50%', description: 'Odkljukaj za deaktivacijo – uporabnik se ne bo mogel prijaviti.' },
                },
                {
                  name: 'zadnjaPrijava',
                  label: 'Zadnja prijava v sistem',
                  type: 'date',
                  access: { update: adminFieldOnly },
                  admin: { width: '50%', readOnly: true },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// Pomožno: ali je trenutni uporabnik administrator (za uvoz drugod).
export { isAdmin }
