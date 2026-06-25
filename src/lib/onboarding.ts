// Skupna logika napredka (onboarding) kandidata – uporabljata jo kandidatova osebna plošča
// in onboarding-tabela za administratorja.

export type OnboardingKorak = { kljuc: string; label: string; done: boolean }

const ima = (v: unknown) => (typeof v === 'string' ? v.trim().length > 0 : v != null && v !== false)

// Koraki dopolnjevanja kandidatnega profila (iz polj zbirke »users«).
export function kandidatKoraki(u: Record<string, unknown>): OnboardingKorak[] {
  return [
    { kljuc: 'osnovno', label: 'Osnovni podatki in kontakt', done: ima(u.ime) && (ima(u.telefon) || ima(u.osebniEmail)) },
    { kljuc: 'foto', label: 'Fotografija', done: ima(u.fotografija) },
    { kljuc: 'predstavitev', label: 'Kratka predstavitev', done: ima(u.opis) },
    { kljuc: 'podrocja', label: 'Področja sodelovanja', done: ima(u.podrocjaSodelovanja) },
    { kljuc: 'zivljenjepis', label: 'Življenjepis (dokument)', done: ima(u.zivljenjepis) },
    { kljuc: 'dokumentacija', label: 'Zahtevani dokumenti oddani', done: u.statusDokumentacije === 'popolno' },
  ]
}

export function kandidatNapredek(u: Record<string, unknown>) {
  const koraki = kandidatKoraki(u)
  const opravljeno = koraki.filter((k) => k.done).length
  const stevilo = koraki.length
  const odstotek = Math.round((opravljeno / stevilo) * 100)
  const naslednje = koraki.find((k) => !k.done) || null
  return { koraki, opravljeno, stevilo, odstotek, naslednje }
}
