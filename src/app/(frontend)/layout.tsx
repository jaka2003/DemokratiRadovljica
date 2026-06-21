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
    'Lokalna ekipa Demokrati Radovljica za lokalne volitve 2026. Program konkretnih rešitev za uspešno občino Radovljica – sodeluj, predlagaj, soustvarjaj.',
  keywords: [
    'Demokrati Radovljica',
    'Radovljica',
    'lokalne volitve 2026',
    'župan Radovljica',
    'občina Radovljica',
    'program Radovljica',
    'pobude občanov',
    'Demokrati',
    'Lesce',
    'Begunje',
    'Kropa',
    'Brezje',
  ],
  applicationName: 'Demokrati Radovljica',
  authors: [{ name: 'Demokrati Radovljica' }],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: 'website',
    locale: 'sl_SI',
    url: serverUrl,
    siteName: 'Demokrati Radovljica',
    title: 'Demokrati Radovljica – Uspešna Radovljica 2026–2034',
    description:
      'Lokalna ekipa Demokrati Radovljica za lokalne volitve 2026. Program konkretnih rešitev za uspešno občino Radovljica.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demokrati Radovljica – Uspešna Radovljica 2026–2034',
    description: 'Program konkretnih rešitev za uspešno občino Radovljica. Sodeluj, predlagaj, soustvarjaj.',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Demokrati Radovljica',
  alternateName: 'Demokrati – Radovljica',
  url: serverUrl,
  logo: `${serverUrl}/favicon.png`,
  description:
    'Lokalna ekipa Demokrati Radovljica za lokalne volitve 2026 v občini Radovljica – odgovorno, pregledno in razvojno.',
  areaServed: { '@type': 'AdministrativeArea', name: 'Občina Radovljica' },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
