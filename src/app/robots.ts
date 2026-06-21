import type { MetadataRoute } from 'next'

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://demokratiradovljica.com'

// /robots.txt – dovoli iskalnikom javne strani, skrij admin in interne poti.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/interno', '/pobude/oddaj', '/pobude/javne'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
