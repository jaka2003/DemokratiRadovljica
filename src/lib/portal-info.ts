// Opisi vlog za e-pošto ob spremembi statusa uporabnika: kaj mu portal omogoča.

type VlogaInfo = { naziv: string; omogoca: string[] }

export const VLOGA_PORTAL: Record<string, VlogaInfo> = {
  administrator: { naziv: 'Administrator', omogoca: ['poln dostop do upravljanja celotne kampanje'] },
  urednik: { naziv: 'Urednik vsebin', omogoca: ['urejanje novic, programa, kandidatov in javne strani'] },
  clan: {
    naziv: 'Član',
    omogoca: ['pregled novic in dogodkov', 'oddajo pobud za svoj kraj', 'klepet z ekipo', 'prijavo na dogodke'],
  },
  neclan: { naziv: 'Podpornik', omogoca: ['spremljanje novic in dogodkov', 'oddajo pobud za svoj kraj'] },
  mladi_demokrat: {
    naziv: 'Mladi demokrat',
    omogoca: ['klepet mladih demokratov', 'dogodke in akcije mladih', 'oddajo pobud'],
  },
  kandidat_svetnik: {
    naziv: 'Kandidat za svetnika',
    omogoca: [
      'svoj kandidatni profil z napredkom (kaj morate še urediti)',
      'naloge kampanje',
      'dopisne seje – elektronsko glasovanje',
      'koledar dogodkov in klepet ekipe',
    ],
  },
  kandidat_zupan: {
    naziv: 'Kandidat za župana',
    omogoca: ['svoj profil in javno predstavitev', 'ekipo, dogodke in naloge kampanje', 'dopisne seje in klepet ekipe'],
  },
  ekipa_kampanja: {
    naziv: 'Ekipa za vodenje kampanje',
    omogoca: ['koledar in naloge kampanje', 'klepet ekipe', 'organizacijo dogodkov'],
  },
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

// HTML opis za e-pošto: naziv vlog + kaj portal omogoča (združeno, brez podvajanja).
export function portalInfoHtml(vloge: string[]): string {
  const znane = vloge.map((v) => VLOGA_PORTAL[v]).filter(Boolean) as VlogaInfo[]
  if (znane.length === 0) return ''
  const nazivi = znane.map((z) => z.naziv).join(', ')
  const omogoca = [...new Set(znane.flatMap((z) => z.omogoca))]
  const tocke = omogoca.map((o) => `<li>${esc(o)}</li>`).join('')
  return `
    <p>Vaša vloga v sistemu: <strong>${esc(nazivi)}</strong>.</p>
    <p>Kaj vam portal omogoča:</p>
    <ul>${tocke}</ul>
  `
}
