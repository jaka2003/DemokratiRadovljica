import type { CollectionConfig } from 'payload'
import { adminOnly, adminOrUrednik } from '../access/roles'
import { VPRASANJE_STATUSI } from '../lib/vprasanja'

// Vprašanja občanov (javni Q&A). Občani jih oddajo na strani »/vprasanja«; ekipa odgovori in
// objavi, da se prikažejo javno. Osebni podatki (e-naslov) se nikoli ne prikažejo.
export const Vprasanja: CollectionConfig = {
  slug: 'vprasanja',
  labels: { singular: 'Vprašanje občana', plural: 'Vprašanja občanov' },
  admin: {
    useAsTitle: 'vprasanje',
    defaultColumns: ['vprasanje', 'status', 'objavljeno', 'createdAt'],
    group: 'Pobude in sporočila',
    description:
      'Vprašanja, ki jih občani oddajo na strani »Vprašanja občanov«. Napiši odgovor in ga objavi (zavihek »Odgovor«), da se prikaže javno. E-naslov občana je zaseben.',
  },
  access: {
    // Vprašanja oddajo občani prek javne strani (strežniška točka z overrideAccess).
    create: () => false,
    read: adminOrUrednik,
    update: adminOrUrednik,
    delete: adminOnly,
  },
  hooks: {
    // Ko vprašanje objaviš in ima odgovor, obvesti občana po e-pošti (če ga je pustil).
    // Odloženo (setTimeout) ZUNAJ transakcije in zavarovano z »obvescenoOb«, da se pošlje le enkrat.
    afterChange: [
      ({ req, doc }) => {
        const d = doc as {
          id: string | number
          email?: string
          objavljeno?: boolean
          odgovor?: string
          obvescenoOb?: string
        }
        if (!d?.email || d.obvescenoOb || !d.objavljeno || !d.odgovor) return doc
        const email = d.email
        setTimeout(async () => {
          try {
            const sve = (await req.payload.findByID({
              collection: 'vprasanja',
              id: d.id,
              depth: 0,
              overrideAccess: true,
            })) as { obvescenoOb?: string }
            if (sve?.obvescenoOb) return // medtem že obveščen
            const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
            await req.payload.sendEmail({
              to: email,
              subject: 'Odgovorili smo na vaše vprašanje – Demokrati Radovljica',
              html: `
                <p>Pozdravljeni,</p>
                <p>na vaše vprašanje smo objavili odgovor. Preberete ga lahko tukaj:</p>
                <p><a href="${base}/vprasanja" style="display:inline-block;background:#00bbc1;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Poglej odgovore</a></p>
                <p>Hvala, ker sodelujete pri oblikovanju boljše občine.</p>
                <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
              `,
            })
            await req.payload.update({
              collection: 'vprasanja',
              id: d.id,
              data: { obvescenoOb: new Date().toISOString() },
              overrideAccess: true,
            })
          } catch (e) {
            console.error('Obvestilo o odgovoru ni bilo poslano:', e)
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
          label: 'Vprašanje',
          fields: [
            { name: 'vprasanje', label: 'Vprašanje', type: 'textarea', required: true },
            {
              name: 'imeObcana',
              label: 'Ime občana (neobvezno)',
              type: 'text',
              admin: { description: 'Kot ga je vpisal občan. Javno se prikaže LE, če je spodaj dovolil objavo imena.' },
            },
            {
              name: 'prikaziIme',
              label: 'Občan dovoli objavo svojega imena',
              type: 'checkbox',
              defaultValue: false,
              admin: { components: { Cell: '/components/admin/DaNeCell#DaNeCell' } },
            },
          ],
        },
        {
          label: 'Kontakt (zasebno)',
          description: 'Osebni podatki – nikoli javno (GDPR). E-naslov se uporabi le za obvestilo o odgovoru.',
          fields: [
            { name: 'email', label: 'E-naslov občana', type: 'email' },
            { name: 'soglasjeGDPR', label: 'Soglaša z obdelavo osebnih podatkov', type: 'checkbox', defaultValue: false },
          ],
        },
        {
          label: 'Odgovor (interno)',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  required: true,
                  defaultValue: 'novo',
                  options: VPRASANJE_STATUSI.map((s) => ({ label: s.label, value: s.value })),
                  admin: { width: '50%' },
                },
                {
                  name: 'objavljeno',
                  label: 'Objavljeno (prikaži javno)',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '50%',
                    description: 'Prikaže se javno le, ko je objavljeno IN ima odgovor.',
                    components: { Cell: '/components/admin/DaNeCell#DaNeCell' },
                  },
                },
              ],
            },
            { name: 'odgovor', label: 'Odgovor ekipe (javni)', type: 'textarea' },
            {
              name: 'povezanoPodrocje',
              label: 'Povezano programsko področje (neobvezno)',
              type: 'relationship',
              relationTo: 'programska-podrocja',
              admin: { description: 'Poveže vprašanje s področjem programa (za razvrstitev na javni strani).' },
            },
            { name: 'odgovoril', label: 'Odgovoril/-a', type: 'relationship', relationTo: 'users' },
            { name: 'notranjeOpombe', label: 'Notranje opombe', type: 'textarea' },
          ],
        },
      ],
    },
    { name: 'obvescenoOb', type: 'date', admin: { hidden: true } },
  ],
}
