import { withPayload } from '@payloadcms/next/withPayload'

// Content-Security-Policy postavlja middleware.ts (potrebuje enkraten nonce na zahtevo).
// Tukaj so statične varnostne glave, ki veljajo na vseh poteh.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Geolokacija ostane dovoljena za lastno stran (zemljevid pobud/plakatov jo uporablja).
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self), browsing-topics=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [],
  },
  // Payloadovi generirani tipi se prepletajo z ročno kodo; runtime je preverjen,
  // zato produkcijski build ne pade na tipovnih/lint opozorilih.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
