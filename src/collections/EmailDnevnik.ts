import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access/roles'

// Evidenca poslanih množičnih e-poštnih sporočil kandidatom (spec. 11.2).
export const EmailDnevnik: CollectionConfig = {
  slug: 'email-dnevnik',
  labels: { singular: 'Poslano sporočilo', plural: 'Dnevnik e-pošte' },
  admin: {
    useAsTitle: 'zadeva',
    defaultColumns: ['zadeva', 'filter', 'prejemnikov', 'createdAt'],
    group: 'Kandidati',
    description: 'Evidenca množičnih e-poštnih sporočil, poslanih kandidatom (zadeva, izbira prejemnikov, število, datum).',
  },
  access: {
    read: adminOnly,
    // Zapise ustvari sistem ob pošiljanju (overrideAccess) – ročno se ne ustvarjajo, samo bere.
    create: () => false,
    update: () => false,
    delete: adminOnly,
  },
  fields: [
    { name: 'zadeva', label: 'Zadeva', type: 'text' },
    { name: 'filter', label: 'Izbira prejemnikov', type: 'text' },
    { name: 'prejemnikov', label: 'Število prejemnikov', type: 'number' },
    { name: 'posiljatelj', label: 'Pošiljatelj', type: 'text' },
    { name: 'vsebina', label: 'Vsebina', type: 'textarea' },
  ],
}
