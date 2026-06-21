import { getPayload } from 'payload'
import config from '../src/payload.config'

// Enkraten korak za produkcijo: ustvari/uskladi shemo v PostgreSQL in vpiše privzete podatke.
// Zaganja se prek storitve "migrate" v docker-compose (NODE_ENV=development → Payload push).

// --- Priprava pred push: prehod polja "vloga" iz posameznega v večkratno (hasMany) ---
// Na PostgreSQL star stolpec "users.vloga" (enum) prepreči posodobitev enum tipa
// (DROP TYPE enum_users_vloga ... → "cannot drop type, column depends on it").
// Zato star stolpec odstranimo VNAPREJ; push nato ustvari novo tabelo users_vloga.
// Idempotentno: izvede se le, če "vloga" še obstaja kot navaden stolpec (ne kot hasMany tabela).
const uri = process.env.DATABASE_URI || ''
if (uri.startsWith('postgres')) {
  try {
    const { Client } = await import('pg')
    const client = new Client({ connectionString: uri })
    await client.connect()
    const { rows } = await client.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'vloga'`,
    )
    if (rows.length > 0) {
      // Star stolpec še obstaja → smo pred migracijo. Odstrani ga (in morebitni
      // ostanek tabele users_vloga iz prej neuspelega poskusa), da push uskladi čisto.
      await client.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "vloga"`)
      await client.query(`DROP TABLE IF EXISTS "users_vloga"`)
      console.log('Priprava: odstranjen star stolpec users.vloga (prehod na večkratno polje).')
    }
    await client.end()
  } catch (e) {
    console.warn('Priprava vloga (pred push) preskočena: ' + (e as Error).message)
  }
}

const payload = await getPayload({ config })
payload.logger.info('✅ Shema je usklajena, privzeti podatki vpisani.')
process.exit(0)
