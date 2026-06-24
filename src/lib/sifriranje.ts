import crypto from 'crypto'

// Šifriranje vsebine sporočil v bazi (encryption at rest) z AES-256-GCM.
// Ključ se izpelje iz KLEPET_KEY (če je nastavljen) ali iz PAYLOAD_SECRET. Ključ je SAMO v
// okolju strežnika (.env), nikoli v bazi ali gitu. To ščiti pred krajo varnostne kopije ali
// pokukom v bazo. NE ščiti pred popolnim prevzemom strežnika (ključ je tam) – to je zavestna
// izbira (glej razlago E2E). Metapodatki (kdo, komu, kdaj) ostanejo nešifrirani.

const PREDPONA = 'enc:v1:'

let kljucPomnilnik: Buffer | null = null
function kljuc(): Buffer {
  if (kljucPomnilnik) return kljucPomnilnik
  const skrivnost = process.env.KLEPET_KEY || process.env.PAYLOAD_SECRET || 'demokrati-klepet-fallback'
  kljucPomnilnik = crypto.createHash('sha256').update(String(skrivnost)).digest() // 32 bajtov
  return kljucPomnilnik
}

// Ali je dana vrednost že šifrirana (v našem formatu).
export const jeSifrirano = (v: unknown): boolean => typeof v === 'string' && v.startsWith(PREDPONA)

// Šifrira besedilo. Vrne »enc:v1:<iv>:<tag>:<podatki>« (base64). Idempotentno: že šifrirano vrne nazaj.
export function sifriraj(besedilo: string): string {
  if (typeof besedilo !== 'string' || besedilo.length === 0) return besedilo
  if (besedilo.startsWith(PREDPONA)) return besedilo
  try {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', kljuc(), iv)
    const enc = Buffer.concat([cipher.update(besedilo, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return `${PREDPONA}${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`
  } catch {
    // Če šifriranje spodleti, raje shrani navadno besedilo, kot da izgubiš sporočilo (neusodno).
    return besedilo
  }
}

// Dešifrira vrednost. Če ni v našem formatu (npr. staro navadno besedilo), jo vrne nespremenjeno.
export function desifriraj(vrednost: string): string {
  if (typeof vrednost !== 'string' || !vrednost.startsWith(PREDPONA)) return vrednost
  try {
    const [ivB64, tagB64, dataB64] = vrednost.slice(PREDPONA.length).split(':')
    const iv = Buffer.from(ivB64, 'base64')
    const tag = Buffer.from(tagB64, 'base64')
    const data = Buffer.from(dataB64, 'base64')
    const decipher = crypto.createDecipheriv('aes-256-gcm', kljuc(), iv)
    decipher.setAuthTag(tag)
    const dec = Buffer.concat([decipher.update(data), decipher.final()])
    return dec.toString('utf8')
  } catch {
    // Npr. če se je ključ spremenil – ne razkrij napake, le označi.
    return '[šifrirano sporočilo]'
  }
}
