import type { CollectionConfig } from 'payload'
import { adminOnly, skritoRazenUrednik } from '../access/roles'
import { POBUDA_KATEGORIJE, POBUDA_STATUSI, KRAJI } from '../lib/pobude'

// Pobude občanov (spec. 3.6 in 11.3).
// Javne pobude se prikažejo anonimizirano prek namenske končne točke /pobude/javne,
// zato je branje te zbirke prek API-ja omejeno na prijavljene uporabnike.
export const Pobude: CollectionConfig = {
  slug: 'pobude',
  labels: { singular: 'Pobuda', plural: 'Pobude' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'kategorija', 'kraj', 'status', 'javnoObjavljeno', 'createdAt'],
    group: 'Obravnava',
    hidden: skritoRazenUrednik,
    description:
      'Pobude, ki jih občani oddajo na strani »Pobude in zemljevid«. Tukaj jih pregledaš, nastaviš status in odločiš, ali se anonimizirano prikažejo na javnem zemljevidu (zavihek »Obravnava«).',
  },
  access: {
    // Pobude oddajo občani prek javne strani (strežniška točka z overrideAccess) – ročno se ne ustvarjajo.
    create: () => false,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Pobuda',
          fields: [
            { name: 'naslov', label: 'Naslov pobude', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'kategorija',
                  label: 'Kategorija',
                  type: 'select',
                  required: true,
                  options: POBUDA_KATEGORIJE.map((k) => ({ label: k.label, value: k.value })),
                  admin: { width: '50%' },
                },
                {
                  name: 'kraj',
                  label: 'Kraj',
                  type: 'select',
                  required: true,
                  options: KRAJI.map((k) => ({ label: k, value: k })),
                  admin: { width: '50%' },
                },
              ],
            },
            { name: 'opis', label: 'Opis težave / predloga', type: 'textarea', required: true },
            {
              type: 'row',
              fields: [
                { name: 'lat', label: 'Zemljepisna širina (lat)', type: 'number', admin: { width: '50%' } },
                { name: 'lng', label: 'Zemljepisna dolžina (lng)', type: 'number', admin: { width: '50%' } },
              ],
            },
            {
              name: 'foto',
              label: 'Fotografije',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 4,
              admin: { description: 'Do 4 fotografije težave (občan jih lahko priloži ob oddaji).' },
            },
          ],
        },
        {
          label: 'Predlagatelj (zasebno)',
          description: 'Osebni podatki – nikoli se ne prikažejo javno (GDPR).',
          fields: [
            { name: 'imePriimek', label: 'Ime in priimek', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'E-poštni naslov', type: 'email', required: true, admin: { width: '50%' } },
                { name: 'telefon', label: 'Telefon (neobvezno)', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'soglasjeGDPR',
              label: 'Soglaša z obdelavo osebnih podatkov',
              type: 'checkbox',
              required: true,
            },
            {
              name: 'dovoliJavnoObjavo',
              label: 'Dovoli javno anonimizirano objavo pobude',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          label: 'Obravnava (interno)',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  required: true,
                  defaultValue: 'nova',
                  options: POBUDA_STATUSI.map((s) => ({ label: s.label, value: s.value })),
                  admin: { width: '50%' },
                },
                {
                  name: 'javnoObjavljeno',
                  label: 'Prikaži na javnem zemljevidu',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '50%',
                    description: 'Prikaže se le anonimizirano in le, če predlagatelj dovoli objavo.',
                  },
                },
              ],
            },
            { name: 'odgovornaOseba', label: 'Odgovorna oseba', type: 'text' },
            { name: 'notranjeOpombe', label: 'Notranje opombe', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
