// Preverjanje kandidatnih list za občinski svet po ZLV (Zakon o lokalnih volitvah), člen 70a:
//  1) vsak spol mora dobiti NAJMANJ 40 % mest na listi, IN
//  2) v PRVI POLOVICI liste morata biti spola razporejena IZMENIČNO.
// Oba pogoja sta materialna in kumulativna. To je pripomoček – končno skladnost potrdi
// Občinska volilna komisija.

export const SPOL_OPCIJE = [
  { label: 'Moški', value: 'm' },
  { label: 'Ženska', value: 'z' },
] as const

export const MIN_DELEZ = 0.4

export type ListniKandidat = {
  id: string | number
  imePriimek: string
  spol: string // 'm' | 'z' | ''
  vrstniRed: number
  volilnaEnota: string
  dokumentacijaOk: boolean
  povezanZUporabnikom: boolean
}

export type PregledEnote = {
  enota: string
  kandidati: ListniKandidat[]
  n: number
  m: number
  z: number
  brezSpola: number
  odstotekM: number
  odstotekZ: number
  kvotaOk: boolean
  izmenicnostOk: boolean
  opozorila: string[]
}

const spolLabel = (s: string) => (s === 'm' ? 'M' : s === 'z' ? 'Ž' : '?')

// Preveri eno volilno enoto. Vrne strukturiran pregled z opozorili.
export function preveriEnoto(enota: string, vhod: ListniKandidat[]): PregledEnote {
  const kandidati = [...vhod].sort((a, b) => (a.vrstniRed ?? 100) - (b.vrstniRed ?? 100))
  const n = kandidati.length
  const m = kandidati.filter((c) => c.spol === 'm').length
  const z = kandidati.filter((c) => c.spol === 'z').length
  const brezSpola = n - m - z
  const odstotekM = n ? Math.round((m / n) * 100) : 0
  const odstotekZ = n ? Math.round((z / n) * 100) : 0
  const opozorila: string[] = []

  let kvotaOk = true
  let izmenicnostOk = true

  if (brezSpola > 0) {
    opozorila.push(`${brezSpola} kandidat(ov) brez določenega spola – kvote in izmeničnosti ni mogoče v celoti preveriti.`)
  }

  if (n > 1 && brezSpola === 0) {
    // 1) Spolna kvota 40 %
    if (m / n < MIN_DELEZ || z / n < MIN_DELEZ) {
      kvotaOk = false
      const manjStevilo = Math.min(m, z)
      const manjZ = z <= m
      const dodati = Math.max(1, Math.ceil((MIN_DELEZ * n - manjStevilo) / (1 - MIN_DELEZ)))
      opozorila.push(
        `Spolna kvota ni izpolnjena: ${m} M (${odstotekM} %), ${z} Ž (${odstotekZ} %). ` +
          `Noben spol ne sme biti pod 40 %. Dodaj najmanj ${dodati} ${manjZ ? 'kandidatk (Ž)' : 'kandidatov (M)'}.`,
      )
    }

    // 2) Izmeničnost v prvi polovici liste
    const polovica = Math.ceil(n / 2)
    for (let i = 1; i < polovica; i++) {
      if (kandidati[i].spol === kandidati[i - 1].spol) {
        izmenicnostOk = false
        opozorila.push(
          `Izmeničnost v prvi polovici liste ni upoštevana: mesti ${i} (${spolLabel(kandidati[i - 1].spol)}) in ${i + 1} (${spolLabel(kandidati[i].spol)}) sta istega spola.`,
        )
        break
      }
    }
  }

  return { enota, kandidati, n, m, z, brezSpola, odstotekM, odstotekZ, kvotaOk, izmenicnostOk, opozorila }
}

// Imena, ki se pojavijo na več kot enem mestu (možna dvojna kandidatura).
export function dvojneKandidature(vsi: ListniKandidat[]): string[] {
  const stetje = new Map<string, number>()
  for (const k of vsi) {
    const ime = k.imePriimek.trim().toLowerCase()
    if (!ime) continue
    stetje.set(ime, (stetje.get(ime) || 0) + 1)
  }
  return vsi
    .filter((k) => (stetje.get(k.imePriimek.trim().toLowerCase()) || 0) > 1)
    .map((k) => k.imePriimek)
    .filter((v, i, a) => a.indexOf(v) === i)
}
