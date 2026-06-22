import { getPayload } from 'payload'
import config from '../src/payload.config'

// Pomožni skript za lokalno testiranje zaklepa: `LOCK=1 payload run scripts/set-lock.ts`
const on = process.env.LOCK === '1'
const payload = await getPayload({ config })
await payload.updateGlobal({
  slug: 'nastavitve',
  data: { zaklenjeno: on, zaklenjenoGeslo: 'test123' },
  overrideAccess: true,
})
payload.logger.info(`zaklenjeno = ${on} (geslo: test123)`)
process.exit(0)
