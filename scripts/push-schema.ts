import { getPayload } from 'payload'
import config from '../src/payload.config'

// Pretvori golo besedilo (odstavki ločeni s prazno vrstico) v Lexical richText JSON.
function besediloVLexical(txt: string) {
  const odstavek = (s: string) => {
    const vrstice = s.split('\n')
    const children: Record<string, unknown>[] = []
    vrstice.forEach((v, i) => {
      if (i > 0) children.push({ type: 'linebreak', version: 1 })
      children.push({ type: 'text', text: v, detail: 0, format: 0, mode: 'normal', style: '', version: 1 })
    })
    return { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '', children }
  }
  const odstavki = txt.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  return {
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: odstavki.length ? odstavki.map(odstavek) : [odstavek('')] },
  }
}

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

    // Odstranjena zbirka "sporocila-kandidatom": vnaprej počisti ostanke (FK, stolpec, tabela),
    // sicer push pade na DROP CONSTRAINT (drizzle ga generira brez IF EXISTS). Idempotentno.
    await client.query(
      `ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_sporocila_kandidatom_fk"`,
    )
    await client.query(
      `ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP COLUMN IF EXISTS "sporocila_kandidatom_id" CASCADE`,
    )
    await client.query(`DROP TABLE IF EXISTS "sporocila_kandidatom" CASCADE`)

    // Odstranjena zbirka "deljive-objave": vnaprej počisti ostanke (FK, stolpec, tabela),
    // sicer push pade na DROP CONSTRAINT (drizzle ga generira brez IF EXISTS). Idempotentno.
    await client.query(
      `ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_deljive_objave_fk"`,
    )
    await client.query(
      `ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP COLUMN IF EXISTS "deljive_objave_id" CASCADE`,
    )
    await client.query(`DROP TABLE IF EXISTS "deljive_objave" CASCADE`)

    // Odstranjena zbirka "prostovoljci" (Prijave za sodelovanje): počisti ostanke pred push.
    await client.query(
      `ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_prostovoljci_fk"`,
    )
    await client.query(
      `ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP COLUMN IF EXISTS "prostovoljci_id" CASCADE`,
    )
    await client.query(`DROP TABLE IF EXISTS "prostovoljci" CASCADE`)

    // Prehod polja "heroSlike" na domači strani: iz "upload hasMany" (shranjeno v
    // skupni tabeli domaca_stran_rels) v array vrstic {slika, povezava} (nova tabela
    // domaca_stran_hero_slike). Ker domača stran nima več nobene hasMany relacije,
    // drizzle ponudi PREIMENOVANJE domaca_stran_rels → nova tabela (interaktivni izbirni
    // meni, ki ga "yes |" ne more potrditi). Zato osirotelo rels tabelo odstranimo VNAPREJ –
    // a le ob samem prehodu (dokler nova array tabela še ne obstaja), da je idempotentno
    // in varno, če bi kdaj v prihodnje dodali novo hasMany relacijo na domačo stran.
    const heroArr = await client.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'domaca_stran_hero_slike'`,
    )
    if (heroArr.rows.length === 0) {
      await client.query(`DROP TABLE IF EXISTS "domaca_stran_rels" CASCADE`)
      console.log('Priprava: odstranjena osirotela domaca_stran_rels (prehod heroSlike na array).')
    }

    await client.end()
  } catch (e) {
    console.warn('Priprava vloga (pred push) preskočena: ' + (e as Error).message)
  }
}

const payload = await getPayload({ config })

// Migracija: staro golo besedilo novic (vsebina) prenesi v novo oblikovano polje (telo).
// Idempotentno: le za novice, ki telo še nimajo, a imajo staro vsebino.
try {
  const res = await payload.find({
    collection: 'novice',
    where: { telo: { exists: false } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  let preneseno = 0
  for (const n of res.docs as Record<string, unknown>[]) {
    const txt = String(n.vsebina || '').trim()
    if (!txt) continue
    await payload.update({ collection: 'novice', id: n.id as string, data: { telo: besediloVLexical(txt) }, overrideAccess: true })
    preneseno++
  }
  if (preneseno) payload.logger.info(`Prenesenih ${preneseno} novic v oblikovano polje (telo).`)
} catch (e) {
  payload.logger.warn('Migracija novic (telo) preskočena: ' + (e as Error).message)
}

payload.logger.info('✅ Shema je usklajena, privzeti podatki vpisani.')
process.exit(0)
