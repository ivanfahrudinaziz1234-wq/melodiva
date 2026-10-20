import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/motion/fade-in'
import { SectionHeading } from '@/components/shared/section-heading'
import { VideoPlayer } from '@/components/shared/video-player'
import { videos } from '@/lib/content'

export function VideoFeatured() {
  const featured = videos.find((v) => v.featured) ?? videos[0]
  if (!featured) return null
  return (
    <section className="bg-[#0e0e10] py-20 text-[#f5f1ea] md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-6 [&_p]:text-[#f5f1ea]/75">
          <SectionHeading
            eyebrow="Video"
            title="Dengar sendiri, rasakan suasananya"
            description="Cuplikan penampilan langsung kami. Video baru dimuat setelah Anda menekan tombol putar."
          />
          <Link href="/video" className="group inline-flex min-h-11 items-center gap-2 self-start font-medium text-[#d9b84a]">
            <span className="link-underline">Semua video</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <FadeIn delay={0.15}>
          <VideoPlayer video={featured} className="shadow-2xl ring-1 ring-white/10" />
        </FadeIn>
      </div>
    </section>
  )
}
