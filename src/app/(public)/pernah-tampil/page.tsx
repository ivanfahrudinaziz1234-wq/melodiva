import { NextCue } from '@/components/shared/next-cue'
import { PageHero } from '@/components/shared/page-hero'
import { PerformanceList } from '@/components/sections/performance-list'
import { eventTypeLabels, performances, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Pernah Tampil',
  description: `Daftar venue dan acara yang pernah dimeriahkan ${site.bandName} di ${site.city} dan sekitarnya.`,
  path: '/pernah-tampil',
})

export default function PernahTampilPage() {
  return (
    <>
      <PageHero
        eyebrow="Rekam Jejak"
        title="Panggung yang pernah kami isi"
        description="Dari resepsi pernikahan hingga acara korporat — inilah sebagian tempat kami pernah bermain."
        breadcrumbs={[{ name: 'Pernah Tampil', path: '/pernah-tampil' }]}
      />
      <section className="container-page py-16 md:py-20">
        <PerformanceList items={performances} labels={eventTypeLabels} />
      </section>
      <NextCue href="/galeri" label="Lihat galeri foto" description="Momen-momen terbaik dari atas panggung." />
    </>
  )
}
