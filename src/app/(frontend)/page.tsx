import { Hero } from '@/components/home/Hero'
import { QuickLinks } from '@/components/home/QuickLinks'
import { Identity } from '@/components/home/Identity'
import { ProgramSteps } from '@/components/home/ProgramSteps'
import { Proposals } from '@/components/home/Proposals'
import { PobudePreview } from '@/components/home/PobudePreview'
import { Participate } from '@/components/home/Participate'
import { getDomacaStran } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const d = await getDomacaStran()
  type Media = { url?: string; alt?: string; width?: number; height?: number }
  const glavna = d?.heroFoto as Media | undefined
  const dodatne = (d?.heroSlike as Media[] | undefined) || []
  // Glavna slika je prva, nato dodatne; obdržimo le tiste z naslovom (url).
  const slike = [glavna, ...dodatne]
    .filter((m): m is Media => Boolean(m?.url))
    .map((m) => ({ url: m.url as string, alt: m.alt, width: m.width, height: m.height }))
  const intervalSekunde = (d?.heroInterval as number) || 3
  const heroPovezava = (d?.heroPovezava as string) || ''
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
        povezava={heroPovezava}
      />
      <QuickLinks />
      <Identity />
      <ProgramSteps koraki={koraki} />
      <Proposals />
      <PobudePreview />
      <Participate />
    </>
  )
}
