import Link from 'next/link'
import { type ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'teal'

const styles: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-800',
  teal: 'bg-teal text-white hover:bg-teal-600',
  outline: 'border border-navy/25 text-navy hover:border-teal hover:text-teal',
}

export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
