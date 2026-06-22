import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Medij',
    plural: 'Mediji',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: 'Sistem',
    // Skrito iz menija – slike se nalagajo neposredno pri poljih vsebine.
    // (Upload polja še vedno delujejo; to skrije le ločen seznam medijev.)
    hidden: true,
    description: 'Vse naložene slike in datoteke. Nalagaš jih neposredno pri posameznem polju.',
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    // Fokusna točka: ob uploadu povlečeš točko (npr. obraz), okoli katere se slika obreže.
    // Orodje za obrez omogoči ročni izrez za posamezno sliko, če je treba.
    focalPoint: true,
    crop: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1600, height: 1000, position: 'centre' },
    ],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  },
  fields: [
    {
      name: 'alt',
      label: 'Nadomestno besedilo (alt)',
      type: 'text',
    },
  ],
}
