import { redirect } from 'next/navigation'
import { getNastavitve } from '@/lib/queries'
import { GateScreen } from '@/components/site/GateScreen'

export const dynamic = 'force-dynamic'

export default async function ZaklenjenoPage() {
  const n = (await getNastavitve()) as Record<string, unknown>
  const zaklenjeno = Boolean(n.zaklenjeno) && Boolean(n.zaklenjenoGeslo)
  // Če stran ni zaklenjena, vstopni zaslon ni potreben.
  if (!zaklenjeno) redirect('/')

  return (
    <GateScreen
      naslov={String(n.zaklenjenoNaslov || 'Kmalu odpiramo.')}
      besedilo={String(n.zaklenjenoBesedilo || '')}
    />
  )
}
