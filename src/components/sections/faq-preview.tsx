import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/motion/fade-in'
import { FaqList } from '@/components/shared/faq-list'
import { SectionHeading } from '@/components/shared/section-heading'
import { faqs } from '@/lib/content'

export function FaqPreview() {
  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="FAQ" title="Pertanyaan yang sering diajukan" description="Belum menemukan jawabannya? Tanyakan langsung lewat WhatsApp." />
          <Link href="/faq" className="group inline-flex min-h-11 items-center gap-2 self-start font-medium text-primary-text">
            <span className="link-underline">Semua pertanyaan</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <FadeIn delay={0.1}>
          <FaqList items={faqs.slice(0, 5)} />
        </FadeIn>
      </div>
    </section>
  )
}
