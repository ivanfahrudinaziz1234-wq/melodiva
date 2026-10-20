import { FadeIn, StaggerChildren, StaggerItem } from '@/components/motion/fade-in'
import { NextCue } from '@/components/shared/next-cue'
import { PageHero } from '@/components/shared/page-hero'
import { VideoPlayer } from '@/components/shared/video-player'
import { eventTypeLabels, site, videos } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Video',
  description: `Video penampilan live ${site.bandName}: wedding, event, party, dan reguler.`,
  path: '/video',
})

export default function VideoPage() {
  const featured = videos.find((v) => v.featured) ?? videos[0]
  const rest = videos.filter((v) => v.id !== featured?.id)

  return (
    <>
      <PageHero
        eyebrow="Video"
        title="Dengar sendiri suasananya"
        description="Video baru dimuat setelah Anda menekan tombol putar, jadi halaman tetap ringan."
        breadcrumbs={[{ name: 'Video', path: '/video' }]}
      />
      <section className="container-page flex flex-col gap-14 py-16 md:py-20">
        {featured && (
          <FadeIn>
            <VideoPlayer video={featured} priority />
          </FadeIn>
        )}
        {rest.length > 0 && (
          <StaggerChildren as="ul" className="grid gap-8 md:grid-cols-2">
            {rest.map((v) => (
              <StaggerItem as="li" key={v.id} className="flex flex-col gap-3">
                <VideoPlayer video={v} />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-text">{eventTypeLabels[v.category] ?? v.category}</span>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </section>
      <NextCue href="/layanan" label="Lihat paket layanan" description="Pilih formasi yang pas untuk acara Anda." />
    </>
  )
}
