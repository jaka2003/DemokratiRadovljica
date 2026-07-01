import { Hero } from '@/components/home/Hero'
import { QuickLinks } from '@/components/home/QuickLinks'
import { Identity } from '@/components/home/Identity'
import { ProgramSteps } from '@/components/home/ProgramSteps'
import { Proposals } from '@/components/home/Proposals'
import { PobudePreview } from '@/components/home/PobudePreview'
import { Participate } from '@/components/home/Participate'
import { NoviceHome } from '@/components/home/NoviceHome'
import { getDomacaStran, getNovice } from '@/lib/queries'

export const dynamic = 'force-dynamic'

// Domača stran: lasten canonical in og:url (sicer podstrani ne podedujejo napačnega doma).
export const metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

export default async function HomePage() {
  const [d, novice] = await Promise.all([getDomacaStran(), getNovice(3)])
  type Media = { url?: string; alt?: string; width?: number; height?: number }
  const glavna = d?.heroFoto as Media | undefined
  const heroPovezava = (d?.heroPovezava as string) || ''
  const dodatne = (d?.heroSlike as { slika?: Media; povezava?: string }[] | undefined) || []
  // Glavna slika je prva (z glavno povezavo), nato dodatne (vsaka s svojo povezavo).
  const slike = [
    glavna ? { ...glavna, povezava: heroPovezava } : undefined,
    ...dodatne.map((r) => (r?.slika ? { ...r.slika, povezava: r.povezava || '' } : undefined)),
  ]
    .filter((m): m is Media & { povezava: string } => Boolean(m?.url))
    .map((m) => ({ url: m.url as string, alt: m.alt, width: m.width, height: m.height, povezava: m.povezava || '' }))
  const intervalSekunde = (d?.heroInterval as number) || 3
  const koraki = (d?.koraki as { naslov?: string }[]) || []

  return (
    <>
      <Hero
        naslov={d?.heroNaslov as string}
        podnaslov={d?.heroPodnaslov as string}
        opis={d?.heroOpis as string}
        poudarek={d?.heroPoudarek as string}
        tagline={d?.heroTagline as string}
        slike={slike}
        intervalSekunde={intervalSekunde}
      />
      <QuickLinks />
      <NoviceHome novice={novice} />
      <Identity />
      <ProgramSteps koraki={koraki} />
      <Proposals />
      <PobudePreview />
      <Participate />
    </>
  )
}
