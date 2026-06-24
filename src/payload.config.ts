import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'
import { sl } from '@payloadcms/translations/languages/sl'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pobude } from './collections/Pobude'
import { ProgramskaPodrocja } from './collections/ProgramskaPodrocja'
import { Kraji } from './collections/Kraji'
import { Ekipa } from './collections/Ekipa'
import { Prostovoljci } from './collections/Prostovoljci'
import { Dokumenti } from './collections/Dokumenti'
import { Naloge } from './collections/Naloge'
import { KontaktSporocila } from './collections/KontaktSporocila'
import { Novice } from './collections/Novice'
import { EmailDnevnik } from './collections/EmailDnevnik'
import { Svetniki } from './collections/Svetniki'
import { PlakatnaMesta } from './collections/PlakatnaMesta'
import { Dogodki } from './collections/Dogodki'
import { Seje } from './collections/Seje'
import { Glasovi } from './collections/Glasovi'
import { Nastavitve } from './globals/Nastavitve'
import { Kandidat } from './globals/Kandidat'
import { DomacaStran } from './globals/DomacaStran'
import { DEFAULT_PODROCJA } from './lib/program'
import { KRAJ_DEFAULTS } from './lib/kraji'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseURI = process.env.DATABASE_URI || 'file:./demokrati.db'
const usePostgres = databaseURI.startsWith('postgres')

// E-pošta: če je nastavljen SMTP, uporabi nodemailer; sicer Payload zapiše sporočila v konzolo.
// Odgovori na vsa odhodna sporočila gredo na ta naslov (pravi nabiralnik).
const replyTo = process.env.REPLY_TO_EMAIL || process.env.ADMIN_NOTIFY_EMAIL || undefined

const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM || 'info@demokratiradovljica.com',
      defaultFromName: 'Demokrati Radovljica',
      // Transporter z globalnimi privzetimi vrednostmi – Reply-To na vseh e-poštah.
      transport: nodemailer.createTransport(
        {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
        },
        replyTo ? { replyTo } : undefined,
      ),
    })
  : undefined

// SQLite v razvoju, PostgreSQL v produkciji – izbira glede na DATABASE_URI.
const db = usePostgres
  ? postgresAdapter({
      pool: { connectionString: databaseURI },
      // Samodejno uskladi shemo ob zagonu (enostaven prvi deploy).
      // Pred uradnim zagonom kampanje preklopimo na migracije (payload migrate).
      push: true,
    })
  : sqliteAdapter({
      client: { url: databaseURI },
      push: true,
    })

export default buildConfig({
  admin: {
    user: Users.slug,
    // Admin vedno v svetli temi (prilagojene komponente uporabljajo svetle barve).
    theme: 'light',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/components/admin/AdminDashboard#AdminDashboard'],
      afterNavLinks: ['/components/admin/InternoNav#InternoNav'],
    },
    meta: {
      title: 'Demokrati Radovljica',
      titleSuffix: ' – Admin',
      icons: [{ rel: 'icon', type: 'image/png', url: '/favicon.png' }],
    },
  },
  collections: [
    Users,
    Media,
    Pobude,
    ProgramskaPodrocja,
    Kraji,
    Ekipa,
    Prostovoljci,
    Dokumenti,
    Naloge,
    KontaktSporocila,
    Novice,
    EmailDnevnik,
    Svetniki,
    PlakatnaMesta,
    Dogodki,
    Seje,
    Glasovi,
  ],
  globals: [Nastavitve, Kandidat, DomacaStran],
  email,
  // Vmesnik administracije VEDNO v slovenščini (brez angleščine, da Payload
  // ne preklopi glede na jezik brskalnika).
  i18n: {
    supportedLanguages: { sl },
    fallbackLanguage: 'sl',
  },
  editor: lexicalEditor(),
  onInit: async (payload) => {
    // Seedanje privzetih podatkov. Zavarovano, da nikoli ne sesuje zagona
    // (npr. če shema še ni ustvarjena – takrat seedanje izvede migrate korak).
    try {
    // Ob prazni bazi vpiši privzeta programska področja (admin jih nato ureja).
    const { totalDocs } = await payload.count({ collection: 'programska-podrocja' })
    if (totalDocs === 0) {
      for (let i = 0; i < DEFAULT_PODROCJA.length; i++) {
        const p = DEFAULT_PODROCJA[i]
        await payload.create({
          collection: 'programska-podrocja',
          data: {
            naslov: p.naslov,
            slug: p.slug,
            ikona: p.ikona,
            kratekOpis: p.kratekOpis,
            povezanaKategorija: p.povezanaKategorija,
            uvod: p.uvod,
            ukrepi: p.ukrepi.map((besedilo) => ({ besedilo })),
            vrstniRed: (i + 1) * 10,
            objavljeno: true,
          },
          overrideAccess: true,
        })
      }
      payload.logger.info(`Vpisanih ${DEFAULT_PODROCJA.length} programskih področij.`)
    }

    const kraji = await payload.count({ collection: 'kraji' })
    if (kraji.totalDocs === 0) {
      for (let i = 0; i < KRAJ_DEFAULTS.length; i++) {
        const k = KRAJ_DEFAULTS[i]
        await payload.create({
          collection: 'kraji',
          data: {
            naslov: k.naslov,
            slug: k.slug,
            opis: k.opis,
            lat: k.lat,
            lng: k.lng,
            vrstniRed: (i + 1) * 10,
            objavljeno: true,
          },
          overrideAccess: true,
        })
      }
      payload.logger.info(`Vpisanih ${KRAJ_DEFAULTS.length} krajev.`)
    }

    // Varovalo: vedno mora obstajati vsaj en administrator. Če ga ni
    // (npr. po spremembi polja »vloga« v večkratno), ga dodeli najstarejšemu
    // uporabniku, da se admin ne zaklene iz sistema.
    const uporabniki = await payload.count({ collection: 'users' })
    if (uporabniki.totalDocs > 0) {
      const admini = await payload.count({ collection: 'users', where: { vloga: { in: ['administrator'] } } })
      if (admini.totalDocs === 0) {
        const prvi = await payload.find({ collection: 'users', sort: 'createdAt', limit: 1, depth: 0 })
        const u = prvi.docs[0] as { id: string | number; vloga?: unknown } | undefined
        if (u) {
          const obstojece = Array.isArray(u.vloga) ? (u.vloga as string[]) : u.vloga ? [String(u.vloga)] : []
          const vloge = Array.from(new Set([...obstojece, 'administrator']))
          await payload.update({ collection: 'users', id: u.id, data: { vloga: vloge }, overrideAccess: true })
          payload.logger.info('Varovalo: administrator dodeljen najstarejšemu uporabniku.')
        }
      }
    }
    } catch (e) {
      payload.logger.warn(
        'onInit seedanje preskočeno (verjetno shema še ni ustvarjena): ' + (e as Error).message,
      )
    }
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  sharp,
  // GDPR: omeji CORS in CSRF na lastno domeno v produkciji.
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean),
})
