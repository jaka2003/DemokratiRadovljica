import type { CollectionConfig } from 'payload'
import { adminOrSelf, adminOnly, adminFieldOnly, isAdmin, isKandidat, VLOGE } from '../access/roles'
import { posljiPozdrav } from '../lib/pozdrav'
import { portalInfoHtml } from '../lib/portal-info'

// Uporabniške vloge / kategorije (uporabnik jih ima lahko več hkrati). Vir: '../access/roles'.
export const ROLES = VLOGE

// Prva (onboarding) naloga, ki jo kandidat samodejno dobi ob dodelitvi kandidatske vloge.
const ONBOARDING_NALOGA_NASLOV = 'Dopolni svoj kandidatni profil'
const ONBOARDING_NALOGA_OPIS =
  'Pozdravljeni! Za začetek dopolnite svoj kandidatni profil: osnovni podatki in kontakt, fotografija, kratka predstavitev, področja sodelovanja, življenjepis in zahtevani dokumenti. Vse uredite v zavihku »Profil in predstavitev«.'

const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Uporabnik sistema', plural: 'Uporabniki sistema' },
  auth: true,
  admin: {
    useAsTitle: 'ime',
    defaultColumns: ['ime', 'email', 'vloga', 'zadnjaPrijava', 'statusProfila'],
    group: 'Ljudje in kampanja',
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
          if (totalDocs === 0) return { ...data, vloga: ['administrator'] }
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
    afterChange: [
      // Ob ustvarjenju uporabnika SAMODEJNO pošljemo pozdravno e-pošto (povezava za nastavitev
      // gesla in dopolnitev profila). Odloženo (setTimeout) ZUNAJ transakcije, da ne pride do
      // zaklepa vrstice na PostgreSQL. Preskočimo prvega (bootstrap) in že obveščene uporabnike.
      ({ req, operation, doc }) => {
        if (operation !== 'create') return doc
        const d = doc as { id: string | number; email?: string; pozdravPoslanOb?: string }
        if (!d.email || d.pozdravPoslanOb) return doc
        setTimeout(async () => {
          try {
            const { totalDocs } = await req.payload.count({ collection: 'users' })
            if (totalDocs <= 1) return
            await posljiPozdrav(req.payload, d.id)
          } catch (e) {
            console.error('Pozdravno sporočilo ni bilo poslano:', e)
          }
        }, 200)
        return doc
      },
      // Ob dodelitvi kandidatske vloge samodejno ustvari prvo nalogo: dopolni profil.
      // Zavarovano proti podvajanju (preverimo, ali naloga s tem naslovom že obstaja).
      ({ req, doc }) => {
        if (!isKandidat(doc as { vloga?: unknown })) return doc
        const d = doc as { id: string | number }
        setTimeout(async () => {
          try {
            const obstoj = await req.payload.count({
              collection: 'naloge',
              where: { and: [{ kandidat: { equals: d.id } }, { naslov: { equals: ONBOARDING_NALOGA_NASLOV } }] },
              overrideAccess: true,
            })
            if (obstoj.totalDocs > 0) return
            await req.payload.create({
              collection: 'naloge',
              data: {
                naslov: ONBOARDING_NALOGA_NASLOV,
                kandidat: d.id,
                status: 'odprta',
                opis: ONBOARDING_NALOGA_OPIS,
              },
              overrideAccess: true,
            })
          } catch (e) {
            console.error('Onboarding naloga ni bila ustvarjena:', e)
          }
        }, 250)
        return doc
      },
      // Ob SPREMEMBI vloge (statusa) uporabnika obvesti po e-pošti: opis nove vloge in kaj mu
      // portal omogoča. Ne velja ob ustvarjenju (takrat gre pozdravno sporočilo).
      ({ req, operation, doc, previousDoc }) => {
        if (operation !== 'update') return doc
        const toArr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : v ? [String(v)] : [])
        const nova = toArr((doc as { vloga?: unknown }).vloga)
        const stara = toArr((previousDoc as { vloga?: unknown } | undefined)?.vloga)
        const enako = nova.length === stara.length && nova.every((v) => stara.includes(v))
        const d = doc as { id: string | number; email?: string; ime?: string }
        if (enako || !d.email || nova.length === 0) return doc
        const email = d.email
        setTimeout(async () => {
          try {
            const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
            const pozdrav = d.ime ? `Pozdravljen/-a, ${escapeHtml(d.ime)},` : 'Pozdravljen/-a,'
            await req.payload.sendEmail({
              to: email,
              subject: 'Posodobitev vaše vloge – Demokrati Radovljica',
              html: `
                <p>${pozdrav}</p>
                <p>v sistemu Demokrati Radovljica smo posodobili vašo vlogo.</p>
                ${portalInfoHtml(nova)}
                <p><a href="${base}/admin" style="display:inline-block;background:#00bbc1;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Prijava v portal</a></p>
                <p style="font-size:12px;color:#888">Če gesla še niste nastavili, uporabite povezavo iz pozdravnega sporočila ob registraciji.</p>
                <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
              `,
            })
          } catch (e) {
            console.error('Obvestilo o spremembi vloge ni bilo poslano:', e)
          }
        }, 200)
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profil in predstavitev',
          description: 'Vsi podatki kandidata na enem mestu – osebni podatki, predstavitev in AI pomoč. Te lahko ureja kandidat sam.',
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
            {
              type: 'collapsible',
              label: 'AI pomoč pri predstavitvi – napolni 3 polja spodaj (neobvezno)',
              admin: {
                initCollapsed: true,
                description:
                  'Vnesi osnovne podatke in klikni »Generiraj z AI«. Samodejno izpolni 3 polja TIK POD tem razdelkom: Kratka predstavitev, Področja sodelovanja in Kratka politična predstavitev (lahko jih nato urediš).',
              },
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
              ],
            },
            {
              name: 'opis',
              label: 'Kratka predstavitev',
              type: 'textarea',
              admin: { description: '↑ To polje izpolni gumb »Generiraj z AI« zgoraj (lahko urediš ali napišeš ročno).' },
            },
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
          label: 'Status (interno)',
          fields: [
            {
              name: 'uporabnikuEmail',
              type: 'ui',
              admin: { components: { Field: '/components/admin/UporabnikuEmail#UporabnikuEmail' } },
            },
            {
              name: 'pozdravPoslanOb',
              label: 'Pozdravno sporočilo poslano',
              type: 'date',
              access: { update: adminFieldOnly },
              admin: { hidden: true },
            },
            {
              name: 'racunStatus',
              type: 'ui',
              admin: { components: { Field: '/components/admin/RacunStatus#RacunStatus' } },
            },
            {
              name: 'vloga',
              label: 'Vloge / kategorije (izbereš lahko več)',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: ['clan'],
              options: [...ROLES],
              access: { update: adminFieldOnly },
              admin: {
                description:
                  'Uporabnik ima lahko več vlog hkrati (npr. član + kandidat za svetnika). »Administrator« da poln dostop do sistema.',
              },
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
                  label: 'Zadnja prijava (aktivacija računa)',
                  type: 'date',
                  access: { update: adminFieldOnly },
                  admin: { width: '50%', readOnly: true, components: { Cell: '/components/admin/RacunCell#RacunCell' } },
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
