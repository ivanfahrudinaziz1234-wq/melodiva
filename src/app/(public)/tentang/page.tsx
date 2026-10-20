import Image from 'next/image'
import { FadeIn, SlideIn, StaggerChildren, StaggerItem } from '@/components/motion/fade-in'
import { iconMap } from '@/components/sections/event-types'
import { NextCue } from '@/components/shared/next-cue'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { history, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import { Music } from 'lucide-react'

export const metadata = pageMetadata({
  title: 'Tentang Kami',
  description: `Kisah ${site.bandName}: visi, misi, gaya musik, dan perjalanan kami sejak ${site.foundedYear} di ${site.city}.`,
  path: '/tentang',
})

export default function TentangPage() {
  return (
    <>
      <PageHero eyebrow="Tentang Kami" title={`Cerita ${site.bandName}`} description={site.description} breadcrumbs={[{ name: 'Tentang', path: '/tentang' }]} />

      <section className="container-page grid gap-12 py-20 md:grid-cols-[1.2fr_1fr]">
        <FadeIn className="flex flex-col gap-5 text-lg text-muted-foreground">
          {history.intro.map((p) => (
            <p key={p.slice(0, 24)} className="text-pretty">
              {p}
            </p>
          ))}
        </FadeIn>
        <SlideIn direction="right" className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
          <Image src="/images/hero/about.webp" alt="Melodiva Music di belakang panggung" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </SlideIn>
      </section>

      <section className="bg-card py-20">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <FadeIn className="rounded-2xl bg-primary p-8 text-primary-foreground md:p-10">
            <h2 className="font-serif text-3xl font-semibold">Visi</h2>
            <p className="mt-4 text-lg text-pretty text-primary-foreground/90">{history.vision}</p>
          </FadeIn>
          <FadeIn delay={0.1} className="rounded-2xl border border-border p-8 md:p-10">
            <h2 className="font-serif text-3xl font-semibold">Misi</h2>
            <ol className="mt-4 flex flex-col gap-3">
              {history.mission.map((m, i) => (
                <li key={m} className="flex gap-3 text-muted-foreground">
                  <span className="font-serif text-xl font-semibold text-gold-text">{String(i + 1).padStart(2, '0')}</span>
                  {m}
                </li>
              ))}
            </ol>
          </FadeIn>
        </div>
        <FadeIn className="container-page mt-12">
          <p className="mx-auto max-w-3xl text-center font-serif text-2xl text-balance md:text-3xl">{history.musicStyle}</p>
        </FadeIn>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Nilai Kami" title="Yang kami pegang di setiap acara" />
        <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {history.values.map((v) => {
            const Icon = iconMap[v.icon] ?? Music
            return (
              <StaggerItem key={v.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                <Icon className="size-7 text-primary-text" aria-hidden="true" />
                <h3 className="font-serif text-xl font-semibold">{v.title}</h3>
                <p className="text-muted-foreground">{v.description}</p>
              </StaggerItem>
            )
          })}
        </StaggerChildren>
      </section>

      <section className="container-page pb-10">
        <SectionHeading eyebrow="Perjalanan" title="Dari panggung kecil ke ballroom" />
        <ol className="relative mt-12 ml-3 border-l-2 border-gold/40">
          {history.timeline.map((t) => (
            <FadeIn as="li" key={t.year} className="relative pb-10 pl-8">
              <span aria-hidden="true" className="absolute top-1.5 -left-[9px] size-4 rounded-full border-4 border-background bg-primary" />
              <span className="font-serif text-2xl font-semibold text-primary-text">{t.year}</span>
              <h3 className="mt-1 text-xl font-semibold">{t.title}</h3>
              <p className="prose-width mt-2 text-muted-foreground">{t.description}</p>
            </FadeIn>
          ))}
        </ol>
      </section>

      <NextCue href="/personel" label="Kenali para personel" description="Enam musisi dengan karakter dan keahlian masing-masing." />
    </>
  )
}
