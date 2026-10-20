import { NextCue } from '@/components/shared/next-cue'
import { PageHero } from '@/components/shared/page-hero'
import { SongBrowser } from '@/components/sections/song-browser'
import { site, songs } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Daftar Lagu',
  description: `Repertoar ${site.bandName}: pop, jazz, dangdut, campursari, rock, religi, dan lagu barat. Bisa request lagu.`,
  path: '/lagu',
})

export default function LaguPage() {
  return (
    <>
      <PageHero
        eyebrow="Repertoar"
        title="Lagu yang siap kami bawakan"
        description="Cari berdasarkan judul atau penyanyi, atau saring berdasarkan genre. Lagu request juga bisa."
        breadcrumbs={[{ name: 'Lagu', path: '/lagu' }]}
      />
      <section className="container-page py-16 md:py-20">
        <SongBrowser songs={songs} />
      </section>
      <NextCue href="/kontak" label="Hubungi kami" description="Diskusikan daftar lagu untuk acara Anda." />
    </>
  )
}
