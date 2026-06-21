import type { MetadataRoute } from 'next'
import { getKraji, getProgramskaPodrocja, getNovice, getSvetniki } from '@/lib/queries'

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://demokratiradovljica.com'

export const dynamic = 'force-dynamic'

// /sitemap.xml – zemljevid strani za iskalnike.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticki: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/program`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pobude`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/obcina`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/lokalne-volitve`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/lokalne-volitve/zupan`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/demokrati`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/mladi-demokrati`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/novice`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/zasebnost`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/pogoji`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const dinamicni: MetadataRoute.Sitemap = []
  try {
    const [kraji, podrocja, novice, svetniki] = await Promise.all([
      getKraji(),
      getProgramskaPodrocja(),
      getNovice(500),
      getSvetniki(),
    ])
    for (const k of kraji)
      dinamicni.push({ url: `${base}/obcina/${k.slug}`, changeFrequency: 'monthly', priority: 0.6 })
    for (const s of svetniki)
      dinamicni.push({ url: `${base}/lokalne-volitve/${s.slug}`, changeFrequency: 'monthly', priority: 0.6 })
    for (const p of podrocja)
      dinamicni.push({ url: `${base}/program/${p.slug}`, changeFrequency: 'monthly', priority: 0.7 })
    for (const n of novice)
      dinamicni.push({
        url: `${base}/novice/${n.slug}`,
        lastModified: n.datum ? new Date(n.datum) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
  } catch {
    // Če baza ob gradnji ni dosegljiva, vrnemo vsaj statične strani.
  }

  return [...staticki, ...dinamicni]
}
