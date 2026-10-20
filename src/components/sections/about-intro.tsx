import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SlideIn } from '@/components/motion/fade-in'
import { Parallax } from '@/components/motion/parallax'
import { SectionHeading } from '@/components/shared/section-heading'
import { history, site } from '@/lib/content'

export function AboutIntro() {
  return (
    <section className="container-page grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
      <SlideIn direction="left" className="relative">
        <Parallax className="aspect-[4/5] overflow-hidden rounded-[2rem]">
          <Image src="/images/hero/about.webp" alt="Personel Melodiva Music bersiap sebelum tampil" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </Parallax>
        <div className="absolute -right-4 -bottom-6 rounded-2xl border border-border bg-card p-5 shadow-xl md:-right-8">
          <p className="font-serif text-4xl font-semibold text-primary-text">{new Date().getFullYear() - site.foundedYear}+</p>
          <p className="text-sm text-muted-foreground">tahun di panggung</p>
        </div>
      </SlideIn>
      <div className="flex flex-col gap-6">
        <SectionHeading eyebrow="Tentang Kami" title="Musik yang hangat untuk momen yang berarti" />
        <SlideIn direction="right" delay={0.1} className="flex flex-col gap-4 text-muted-foreground">
          {history.intro.slice(0, 2).map((p) => (
            <p key={p.slice(0, 24)} className="text-pretty">
              {p}
            </p>
          ))}
          <Link href="/tentang" className="group mt-2 inline-flex min-h-11 items-center gap-2 self-start font-medium text-primary-text">
            <span className="link-underline">Kenali kami lebih dekat</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </SlideIn>
      </div>
    </section>
  )
}
