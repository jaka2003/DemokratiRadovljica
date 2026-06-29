import type { CollectionConfig } from 'payload'
import { adminOnly, adminOrUrednik, skritoRazenUrednik } from '../access/roles'
import { SPOL_OPCIJE, POSTA_OPCIJE, IZOBRAZBA_OPCIJE, PRISTOP_STATUSI } from '../lib/pristop'

// Pristopne izjave (včlanitve). Oddajo jih obiskovalci na strani »/pristop«.
export const PristopneIzjave: CollectionConfig = {
  slug: 'pristopne-izjave',
  labels: { singular: 'Pristopna izjava', plural: 'Pristopne izjave (včlanitve)' },
  admin: {
    useAsTitle: 'imePriimek',
    defaultColumns: ['imePriimek', 'email', 'stalnoMesto', 'status', 'createdAt'],
    listSearchableFields: ['imePriimek', 'email', 'stalnoMesto', 'poklic'],
    group: 'Obravnava',
    hidden: skritoRazenUrednik,
    description:
      'Pristopne izjave za včlanitev, oddane na javni strani »Pridruži se«. Vsebino vnašajo obiskovalci; ti nastaviš »Status« obravnave.',
  },
  access: {
    create: () => false, // oddajo obiskovalci prek strežniške točke (overrideAccess)
    read: adminOrUrednik,
    update: adminOrUrednik,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Pristopna izjava',
          fields: [
            { name: 'imePriimek', label: 'Ime in priimek', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'datumRojstva', label: 'Datum rojstva', type: 'date', required: true, admin: { width: '50%', date: { displayFormat: 'd. M. yyyy' } } },
                { name: 'spol', label: 'Spol', type: 'select', required: true, options: [...SPOL_OPCIJE], admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'E-naslov', type: 'email', required: true, admin: { width: '50%' } },
                { name: 'mobilniTelefon', label: 'Mobilni telefon', type: 'text', admin: { width: '50%' } },
              ],
            },
            { name: 'telefon', label: 'Telefon', type: 'text' },

            {
              type: 'collapsible',
              label: 'Stalno prebivališče',
              admin: { initCollapsed: false },
              fields: [
                { name: 'stalniNaslov', label: 'Naslov', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'stalnoMesto', label: 'Mesto', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'stalnaPosta', label: 'Poštna številka', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Začasno prebivališče (neobvezno)',
              admin: { initCollapsed: true },
              fields: [
                { name: 'zacasniNaslov', label: 'Naslov', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'zacasnoMesto', label: 'Mesto', type: 'text', admin: { width: '50%' } },
                    { name: 'zacasnaPosta', label: 'Poštna številka', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            { name: 'postaNa', label: 'Pošto želim prejemati na', type: 'select', required: true, options: [...POSTA_OPCIJE] },

            {
              type: 'collapsible',
              label: 'Zaposlitev in izobrazba',
              admin: { initCollapsed: false },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'poklic', label: 'Poklic', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'delovnoMesto', label: 'Delovno mesto', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'podjetje', label: 'Podjetje', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'sedezZaposlitve', label: 'Sedež zaposlitve', type: 'text', admin: { width: '50%' } },
                  ],
                },
                { name: 'izobrazba', label: 'Izobrazba', type: 'select', options: [...IZOBRAZBA_OPCIJE] },
              ],
            },
            { name: 'soglasjeGDPR', label: 'Soglaša z obdelavo osebnih podatkov (GDPR)', type: 'checkbox', required: true },
          ],
        },
        {
          label: 'Obravnava (interno)',
          fields: [
            { name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'novo', options: [...PRISTOP_STATUSI] },
            { name: 'notranjeOpombe', label: 'Notranje opombe', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
