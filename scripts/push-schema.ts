import { getPayload } from 'payload'
import config from '../src/payload.config'

// Enkraten korak za produkcijo: ustvari shemo v PostgreSQL in vpiše privzete podatke.
// Zaganja se prek storitve "migrate" v docker-compose (NODE_ENV=development → Payload
// samodejno uskladi shemo / push). Po tem aplikacija normalno deluje.
const payload = await getPayload({ config })
payload.logger.info('✅ Shema je usklajena, privzeti podatki vpisani.')
process.exit(0)
