import { FadeIn } from '@/components/motion/fade-in'
import { ClosingCta } from '@/components/sections/closing-cta'
import { FaqList } from '@/components/shared/faq-list'
import { JsonLd } from '@/components/shared/json-ld'
import { PageHero } from '@/components/shared/page-hero'
import { faqs, site } from '@/lib/content'
import { faqPageLd, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'FAQ',
  description: `Jawaban atas pertanyaan umum seputar sewa live band ${site.bandName}: harga, DP, sound system, durasi, dan request lagu.`,
  path: '/faq',
})

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageLd()} />
      <PageHero
        eyebrow="FAQ"
        title="Pertanyaan yang sering diajukan"
        description="Tidak menemukan jawabannya? Tanyakan langsung lewat WhatsApp."
        breadcrumbs={[{ name: 'FAQ', path: '/faq' }]}
      />
      <section className="container-page max-w-4xl py-16 md:py-20">
        <FadeIn>
          <FaqList items={faqs} />
        </FadeIn>
      </section>
      <ClosingCta title="Masih ada pertanyaan?" />
    </>
  )
}
