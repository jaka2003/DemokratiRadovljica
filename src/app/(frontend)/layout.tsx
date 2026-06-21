import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
})

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(serverUrl),
  title: {
    default: 'Demokrati Radovljica – Uspešna Radovljica 2026–2034',
    template: '%s – Demokrati Radovljica',
  },
  description:
    'Lokalna ekipa Demokrati Radovljica. Program konkretnih rešitev za uspešno občino Radovljica – sodeluj, predlagaj, soustvarjaj.',
  openGraph: {
    type: 'website',
    locale: 'sl_SI',
    siteName: 'Demokrati Radovljica',
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
