import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../(frontend)/globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Kmalu – Demokrati Radovljica',
  robots: { index: false, follow: false },
}

export default function ZaklenjenoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">{children}</body>
    </html>
  )
}
