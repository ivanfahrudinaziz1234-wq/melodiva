import Image from 'next/image'
import Link from 'next/link'
import { StaggerChildren, StaggerItem } from '@/components/motion/fade-in'
import { TiltCard } from '@/components/motion/tilt-card'
import { NextCue } from '@/components/shared/next-cue'
import { PageHero } from '@/components/shared/page-hero'
import { members, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Personel',
  description: `Kenali para musisi ${site.bandName}: vokal, keyboard, gitar, bass, dan drum.`,
  path: '/personel',
})

export default function PersonelPage() {
  return (
    <>
      <PageHero
        eyebrow="Personel"
        title="Wajah di balik setiap nada"
        description="Setiap personel membawa warna sendiri. Bersama, kami menyatu menjadi satu suara."
        breadcrumbs={[{ name: 'Personel', path: '/personel' }]}
      />
      <section className="container-page py-20">
        <StaggerChildren as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <StaggerItem as="li" key={m.slug}>
              <Link href={`/personel/${m.slug}`} className="group block">
                <TiltCard className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <Image src={m.photo} alt={`Foto ${m.name}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col gap-2 p-6">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-text">{m.role}</span>
                    <h2 className="font-serif text-2xl font-semibold">{m.name}</h2>
                    <p className="line-clamp-2 text-muted-foreground">{m.shortBio}</p>
                    <span className="link-underline mt-2 self-start font-medium text-primary-text">Lihat profil</span>
                  </div>
                </TiltCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>
      <NextCue href="/pernah-tampil" label="Lihat di mana kami pernah tampil" description="Ballroom, pendopo, kafe, hingga panggung terbuka." />
    </>
  )
}
