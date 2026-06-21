import { redirect } from 'next/navigation'

// Stran je preimenovana v »Lokalne volitve« – preusmeri stare povezave.
export default function KandidatRedirect() {
  redirect('/lokalne-volitve')
}
