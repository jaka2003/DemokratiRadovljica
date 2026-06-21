import { Container } from '@/components/site/Container'
import PobudeModul from '@/components/pobude/PobudeModul'
import { ShareButtons } from '@/components/site/ShareButtons'
import { getShareInfo } from '@/lib/share'

export const dynamic = 'force-dynamic'

const OPIS =
  'Oddaj pobudo za svoj kraj v občini Radovljica. Odobrene pobude se anonimizirano prikažejo na interaktivnem zemljevidu.'

export async function generateMetadata() {
  const share = await getShareInfo('pobude')
  const title = share.naslov || 'Pobude in zemljevid'
  return {
    title,
    description: OPIS,
    openGraph: {
      title,
      description: OPIS,
      images: share.slikaUrl ? [{ url: share.slikaUrl }] : undefined,
    },
  }
}

export default async function PobudePage() {
  const share = await getShareInfo('pobude')

  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Sodeluj
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy">
            Pobude občanov in zemljevid
          </h1>
          <p className="mt-3 text-muted">
            Predlagaj rešitev za svoj kraj – ceste, pločnike, parkirišča, razsvetljavo, igrišča in
            drugo. Klikni na zemljevid, označi lokacijo in oddaj pobudo.
          </p>
          <div className="mt-5 flex justify-center">
            <ShareButtons title={share.naslov || 'Pobude občanov – Demokrati Radovljica'} hashtags={share.hashtagi} />
          </div>
        </div>

        <div className="mt-12">
          <PobudeModul />
        </div>
      </Container>
    </section>
  )
}
