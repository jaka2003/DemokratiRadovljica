'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { KrajPin } from './ObcinaMap'

const ObcinaMap = dynamic(() => import('./ObcinaMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[460px] items-center justify-center bg-cloud text-muted">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Nalagam zemljevid …
    </div>
  ),
})

export default function ObcinaMapClient({ kraji }: { kraji: KrajPin[] }) {
  return <ObcinaMap kraji={kraji} />
}
