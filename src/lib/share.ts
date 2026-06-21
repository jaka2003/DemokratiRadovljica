import { getNastavitve } from './queries'

export type Vrsta = 'novice' | 'program' | 'pobude'
export type ShareInfo = { slikaUrl?: string; hashtagi?: string; naslov?: string }

type Media = { url?: string } | null | undefined
const urlOf = (m: unknown) => (m as Media)?.url || undefined
const str = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s || undefined
}

// Vrne nastavitve deljenja za določeno vrsto vsebine (po vrsti, sicer privzeto).
export async function getShareInfo(vrsta: Vrsta): Promise<ShareInfo> {
  const n = (await getNastavitve()) as Record<string, unknown>
  const privzetaSlika = urlOf(n.delitevSlika)
  const privzetiHashtagi = str(n.delitevHashtagi)

  const poVrsti: Record<Vrsta, ShareInfo> = {
    novice: { slikaUrl: urlOf(n.delitevNoviceSlika), hashtagi: str(n.delitevNoviceHashtagi) },
    program: { slikaUrl: urlOf(n.delitevProgramSlika), hashtagi: str(n.delitevProgramHashtagi) },
    pobude: {
      slikaUrl: urlOf(n.delitevPobudeSlika),
      hashtagi: str(n.delitevPobudeHashtagi),
      naslov: str(n.delitevPobudeNaslov),
    },
  }

  const v = poVrsti[vrsta]
  return {
    slikaUrl: v.slikaUrl || privzetaSlika,
    hashtagi: v.hashtagi || privzetiHashtagi,
    naslov: v.naslov,
  }
}
