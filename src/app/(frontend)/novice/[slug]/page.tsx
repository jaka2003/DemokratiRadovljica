import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Container } from '@/components/site/Container'
import { ShareButtons } from '@/components/site/ShareButtons'
import { getNovicaBySlug } from '@/lib/queries'
import { getShareInfo } from '@/lib/share'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = await getNovicaBySlug(slug)
  const share = await getShareInfo('novice')
  const slika = (n?.slika as { url?: string })?.url || share.slikaUrl
  return {
    title: n?.naslov || 'Novica',
    description: n?.povzetek,
    alternates: { canonical: `/novice/${slug}` },
    openGraph: {
      title: n?.naslov || 'Novica',
      description: n?.povzetek || undefined,
      type: 'article',
      url: `/novice/${slug}`,
      images: slika ? [{ url: slika }] : undefined,
    },
  }
}

function datum(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getDate()}. ${dt.getMonth() + 1}. ${dt.getFullYear()}`
}

export default async function NovicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = await getNovicaBySlug(slug)
  if (!n) notFound()
  const share = await getShareInfo('novice')

  return (
    <article className="py-12 lg:py-16">
      <Container className="max-w-3xl">
        <Link href="/novice" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-teal">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Vse novice
        </Link>

        {n.datum && <p className="mt-6 text-sm font-medium text-teal-700">{datum(n.datum)}</p>}
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-navy">{n.naslov}</h1>

        {n.slika?.url &&
          (n.slika.width && n.slika.height ? (
            // Naravna velikost – plakati in grafike se prikažejo v celoti, brez obrezovanja.
            <Image
              src={n.slika.url}
              alt={n.slika.alt || n.naslov}
              width={n.slika.width}
              height={n.slika.height}
              priority
              quality={90}
              className="mt-8 h-auto w-full rounded-[var(--radius-card)] border border-line"
              sizes="(max-width: 768px) 100vw, 736px"
            />
          ) : (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] border border-line bg-cloud">
              <Image src={n.slika.url} alt={n.slika.alt || n.naslov} fill priority quality={90} className="object-contain" sizes="(max-width: 768px) 100vw, 736px" />
            </div>
          ))}

        {n.povzetek && <p className="mt-8 text-lg font-medium leading-relaxed text-navy/90">{n.povzetek}</p>}
        {n.telo ? (
          <div className="mt-6 text-base leading-relaxed text-navy/85 [&_a]:font-medium [&_a]:text-teal-700 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-teal [&_blockquote]:pl-4 [&_blockquote]:italic [&_em]:italic [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-navy [&_li]:mb-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
            <RichText data={n.telo as never} />
          </div>
        ) : (
          n.vsebina && <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-navy/85">{n.vsebina}</div>
        )}

        <div className="mt-10 border-t border-line pt-6">
          <ShareButtons title={String(n.naslov || 'Novica')} hashtags={share.hashtagi} />
        </div>
      </Container>
    </article>
  )
}
