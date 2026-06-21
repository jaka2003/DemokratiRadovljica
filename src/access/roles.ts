import type { Access, FieldAccess } from 'payload'

type MaybeUser = { id?: string | number; vloga?: string } | null | undefined

export const isAdmin = (user: MaybeUser): boolean =>
  Boolean(user && (user.vloga === 'administrator' || user.vloga === 'koordinator'))

export const isUrednik = (user: MaybeUser): boolean =>
  Boolean(user && (isAdmin(user) || user.vloga === 'urednik'))

// Collection access: administrator/koordinator vidijo vse, ostali samo svoje zapise.
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true
  if (user) return { id: { equals: user.id } }
  return false
}

// Collection access: dostop le administratorjem/koordinatorjem.
export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

// Collection access: admin vidi vse, kandidat samo zapise, kjer je on lastnik (polje kandidat).
export const ownerOrAdmin =
  (field = 'kandidat'): Access =>
  ({ req: { user } }) => {
    if (isAdmin(user)) return true
    if (user) return { [field]: { equals: user.id } }
    return false
  }

// Field access: urejanje le administratorjem/koordinatorjem.
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => isAdmin(user)
