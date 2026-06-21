import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Novica } from '@/lib/queries'

function datum(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getDate()}. ${dt.getMonth() + 1}. ${dt.getFullYear()}`
}

// Kompakten seznam povezanih novic (za podstrani kraja, področja, kandidata).
export function NoviceMini({ novice, naslov = 'Aktualne objave' }: { novice: Novica[]; naslov?: string }) {
  if (!novice || novice.length === 0) return null
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-navy">{naslov}</h2>
      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
        {novice.map((n) => (
          <li key={n.id}>
            <Link href={`/novice/${n.slug}`} className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-cloud">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy">{n.naslov}</span>
                {n.datum && <span className="text-xs text-muted">{datum(n.datum)}</span>}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-teal" strokeWidth={2} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
