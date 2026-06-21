import Link from 'next/link'
import { NAV, SITE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-20 bg-navy text-white/85">
      <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Blagovna znamka */}
          <div>
            <div className="text-lg font-bold tracking-tight text-white">
              Demokrati <span className="text-teal">Radovljica</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              Lokalna ekipa za odgovorno, pregledno in razvojno občino. Skupaj gradimo občino, v
              kateri se dobro živi vsem generacijam.
            </p>
          </div>

          {/* Navigacija */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Povezave</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 transition-colors hover:text-teal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sodelovanje */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">Sodeluj</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/pobude" className="text-white/80 transition-colors hover:text-teal">
                  Oddaj pobudo
                </Link>
              </li>
              <li>
                <Link href="/demokrati" className="text-white/80 transition-colors hover:text-teal">
                  Pridruži se ekipi
                </Link>
              </li>
              <li>
                <Link href="/novice" className="text-white/80 transition-colors hover:text-teal">
                  Novice in obvestila
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/80 transition-colors hover:text-teal">
                  Interna prijava
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Vse pravice pridržane.
          </p>
          <div className="flex gap-5">
            <Link href="/zasebnost" className="transition-colors hover:text-teal">
              Politika zasebnosti
            </Link>
            <Link href="/pogoji" className="transition-colors hover:text-teal">
              Pogoji uporabe
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
