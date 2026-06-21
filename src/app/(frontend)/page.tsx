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
  const foto = d?.heroFoto as { url?: string; alt?: string } | undefined
  const koraki = (d?.koraki as { naslov?: string }[]) || []

  return (
    <>
      <Hero
        naslov={d?.heroNaslov as string}
        podnaslov={d?.heroPodnaslov as string}
        opis={d?.heroOpis as string}
        poudarek={d?.heroPoudarek as string}
        tagline={d?.heroTagline as string}
        fotoUrl={foto?.url}
        fotoAlt={foto?.alt}
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
