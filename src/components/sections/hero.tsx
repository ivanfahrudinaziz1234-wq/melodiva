import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Music2 } from 'lucide-react'
import { FadeIn } from '@/components/motion/fade-in'
import { MagneticButton } from '@/components/motion/magnetic-button'
import { TextReveal } from '@/components/motion/text-reveal'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { site } from '@/lib/content'

const bars = [0.2, 0.55, 0.35, 0.8, 0.45, 0.65, 0.3, 0.9, 0.5, 0.7, 0.25, 0.6]
const notes = [
  { left: '8%', top: '30%', delay: '0s', size: 'size-6' },
  { left: '82%', top: '22%', delay: '-4s', size: 'size-8' },
  { left: '70%', top: '62%', delay: '-8s', size: 'size-5' },
  { left: '18%', top: '70%', delay: '-2s', size: 'size-7' },
]

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#0e0e10] text-[#f5f1ea]">
      <Image
        src="/images/hero/hero-poster.webp"
        alt="Melodiva Music tampil di panggung dengan lampu hangat"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-60"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/50 to-[#0e0e10]/20" />
      <div aria-hidden="true" className="grain absolute inset-0 opacity-[0.08] mix-blend-overlay" />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {notes.map((n, i) => (
          <Music2
            key={i}
            className={`absolute ${n.size} animate-float-note text-[#d9b84a]/60`}
            style={{ left: n.left, top: n.top, animationDelay: n.delay }}
          />
        ))}
      </div>

      <div className="container-page relative pt-32 pb-20 md:pb-28">
        <FadeIn delay={0.1}>
          <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm backdrop-blur">
            <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
              {[0.6, 1, 0.4].map((d, i) => (
                <span key={i} className="w-[3px] origin-bottom animate-equalizer rounded-full bg-[#d9b84a]" style={{ height: '100%', animationDelay: `-${d}s` }} />
              ))}
            </span>
            Live band {site.city} sejak {site.foundedYear}
          </span>
        </FadeIn>
        <TextReveal
          as="h1"
          animateOnMount
          delay={0.2}
          text={`${site.bandName} — ${site.tagline}`}
          className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] md:text-7xl"
        />
        <FadeIn delay={0.6}>
          <p className="prose-width mt-6 text-pretty text-lg text-[#f5f1ea]/80 md:text-xl">{site.description}</p>
        </FadeIn>
        <FadeIn delay={0.8} className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton>
            <WhatsAppButton size="lg" label="Cek Tanggal via WhatsApp" />
          </MagneticButton>
          <Link
            href="/layanan"
            className="group inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 px-8 text-lg font-medium transition-colors hover:bg-white/10"
          >
            Lihat Layanan
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </FadeIn>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-16 items-end justify-center gap-1.5 opacity-40 md:h-24">
        {bars.concat(bars).map((d, i) => (
          <span
            key={i}
            className="w-1.5 origin-bottom animate-equalizer rounded-t-full bg-gradient-to-t from-[#8c2f39] to-[#d9b84a] md:w-2"
            style={{ height: `${30 + d * 70}%`, animationDelay: `-${d * 1.2}s` }}
          />
        ))}
      </div>
    </section>
  )
}
