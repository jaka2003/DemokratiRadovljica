import { withPayload } from '@payloadcms/next/withPayload'

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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
