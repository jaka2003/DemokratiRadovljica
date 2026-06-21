'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LogIn } from 'lucide-react'
import { NAV, SITE } from '@/lib/site'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo levo */}
        <Link href="/" className="flex items-center" aria-label={SITE.name} onClick={() => setOpen(false)}>
          <Image
            src="/logo-demokrati.svg"
            alt={SITE.name}
            width={196}
            height={40}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        {/* Navigacija desktop */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-navy/80 transition-colors hover:text-teal"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            <LogIn className="h-4 w-4" strokeWidth={2} />
            Prijava
          </Link>
        </nav>

        {/* Hamburger mobile */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-navy lg:hidden"
          aria-label={open ? 'Zapri meni' : 'Odpri meni'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobilni meni */}
      {open && (
        <nav className="border-t border-line bg-white lg:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col px-5 py-3 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line/70 py-3 text-base font-medium text-navy/90 last:border-0"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-base font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              <LogIn className="h-4 w-4" strokeWidth={2} />
              Prijava
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
