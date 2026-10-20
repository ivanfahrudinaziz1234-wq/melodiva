import { NextCue } from '@/components/shared/next-cue'
import { PageHero } from '@/components/shared/page-hero'
import { GalleryBrowser } from '@/components/sections/gallery-browser'
import { eventTypeLabels, gallery, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Galeri',
  description: `Foto penampilan ${site.bandName} di wedding, event, party, dan panggung reguler.`,
  path: '/galeri',
})

export default function GaleriPage() {
  return (
    <>
      <PageHero
        eyebrow="Galeri"
        title="Cerita dari atas panggung"
        description="Ketuk foto untuk memperbesar. Gunakan tombol panah atau geser untuk melihat foto lainnya."
        breadcrumbs={[{ name: 'Galeri', path: '/galeri' }]}
      />
      <section className="container-page py-16 md:py-20">
        <GalleryBrowser items={gallery} labels={eventTypeLabels} />
      </section>
      <NextCue href="/video" label="Tonton video penampilan" description="Dengarkan langsung suara kami." />
    </>
  )
}
