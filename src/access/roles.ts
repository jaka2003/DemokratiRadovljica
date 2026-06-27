import type { Access, FieldAccess } from 'payload'

// Vloge / kategorije uporabnika. Uporabnik jih ima lahko VEČ hkrati (polje je hasMany).
export const VLOGE = [
  { label: 'Administrator', value: 'administrator' },
  { label: 'Urednik vsebin', value: 'urednik' },
  { label: 'Član', value: 'clan' },
  { label: 'Nečlan', value: 'neclan' },
  { label: 'Mladi demokrat', value: 'mladi_demokrat' },
  { label: 'Kandidat za svetnika', value: 'kandidat_svetnik' },
  { label: 'Ekipa za vodenje kampanje', value: 'ekipa_kampanja' },
  { label: 'Kandidat za župana', value: 'kandidat_zupan' },
] as const

// Kandidatske vloge – uporabljene za statistiko, izvoz in pošiljanje e-pošte kandidatom.
export const KANDIDAT_VLOGE = ['kandidat_svetnik', 'kandidat_zupan'] as const

type MaybeUser = { id?: string | number; vloga?: string | string[] | null } | null | undefined

// Ali uporabnik ima dano vlogo (polje je lahko array ali star posamezen niz).
export const imaVlogo = (user: MaybeUser, vloga: string): boolean => {
  const v = user?.vloga
  if (Array.isArray(v)) return v.includes(vloga)
  return v === vloga
}

export const isAdmin = (user: MaybeUser): boolean => imaVlogo(user, 'administrator')

// Ali je uporabnik kandidat (za svetnika ali za župana).
export const isKandidat = (user: MaybeUser): boolean => KANDIDAT_VLOGE.some((v) => imaVlogo(user, v))

// Urednik vsebin: admin ali uporabnik z vlogo »urednik«. Sme urejati javno vsebino
// (novice, program, lista, ekipa, kraji, domača stran), NE pa uporabnikov,
// osebnih podatkov občanov ali sistemskih nastavitev.
export const isUrednik = (user: MaybeUser): boolean => isAdmin(user) || imaVlogo(user, 'urednik')

// Collection access: dostop administratorjem in urednikom vsebin.
export const adminOrUrednik: Access = ({ req: { user } }) => isUrednik(user)

// Collection access: administrator vidi vse, ostali samo svoje zapise.
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true
  if (user) return { id: { equals: user.id } }
  return false
}

// Collection access: dostop le administratorjem.
export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

// Collection access: admin vidi vse, kandidat samo zapise, kjer je on lastnik (polje kandidat).
export const ownerOrAdmin =
  (field = 'kandidat'): Access =>
  ({ req: { user } }) => {
    if (isAdmin(user)) return true
    if (user) return { [field]: { equals: user.id } }
    return false
  }

// Field access: urejanje le administratorjem.
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => isAdmin(user)

// Skrivanje zbirke/globala iz LEVEGA MENIJA administracije glede na vlogo.
// POMEMBNO: vpliva SAMO na prikaz v meniju – NE spreminja dostopa (read/create/update/delete)
// in NE vpliva na javno spletno stran. Uporabnik, ki zbirko sme brati, do nje še vedno pride.
// »skritoRazenUrednik« → v meniju vidijo le administrator in urednik vsebin.
// »skritoRazenAdmin«   → v meniju vidi le administrator.
export const skritoRazenUrednik = ({ user }: { user?: MaybeUser }): boolean => !isUrednik(user)
export const skritoRazenAdmin = ({ user }: { user?: MaybeUser }): boolean => !isAdmin(user)
