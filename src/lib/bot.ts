// Preprost iskalnik za "programskega robota" – BREZ umetne inteligence.
// Normalizira besedilo (male črke, brez šumnikov), izloči koren besed in oceni ujemanje
// poizvedbe s programom oz. vprašanji. Slovensko sklanjatev pokrije skrajšanje na koren.

const STOPWORDS = new Set([
  'in', 'je', 'so', 'na', 'za', 'se', 'si', 'ki', 'ali', 'da', 'bo', 'pa', 'ne', 'po', 'do', 'od',
  'to', 'ta', 'te', 'tega', 'kako', 'kaj', 'kje', 'kdaj', 'zakaj', 'kateri', 'katera', 'katero',
  'katere', 'bi', 'smo', 'ste', 'sem', 'bom', 'imam', 'ima', 'imate', 'imajo', 'vas', 'vam', 'nam',
  'nas', 'mi', 'vi', 'oni', 'pri', 'cez', 'le', 'ker', 'tudi', 'ze', 'bos', 'boste', 'jaz', 'ti',
  'on', 'ona', 'glede', 'okoli', 'okrog', 'vse', 'vsi', 'vsa', 'vec', 'kaksen', 'kaksne', 'kaksni',
])

const DIAKRITIKA = /[̀-ͯ]/g

export const normaliziraj = (s: string): string =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(DIAKRITIKA, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Koreni poizvedbe (brez stopword; skrajšani na 4 znake za slovensko sklanjatev).
export const koreni = (s: string): string[] => {
  const out: string[] = []
  for (const t of normaliziraj(s).split(' ')) {
    if (t.length < 3 || STOPWORDS.has(t)) continue
    out.push(t.length >= 4 ? t.slice(0, 4) : t)
  }
  return [...new Set(out)]
}

// Koliko korenov se pojavi v besedilu (kot predpona besede).
export const oceni = (besedilo: string, qKoreni: string[]): number => {
  if (!qKoreni.length) return 0
  const norm = ' ' + normaliziraj(besedilo)
  let s = 0
  for (const k of qKoreni) if (norm.includes(' ' + k)) s++
  return s
}
