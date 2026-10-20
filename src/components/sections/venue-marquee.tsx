import Link from 'next/link'
import { Marquee } from '@/components/motion/marquee'
import { performances } from '@/lib/content'

export function VenueMarquee() {
  const venues = [...new Set(performances.map((p) => `${p.venue}, ${p.city}`))]
  return (
    <section aria-labelledby="venue-heading" className="border-y border-border py-12">
      <div className="container-page mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="venue-heading" className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-text">
          Pernah tampil di
        </h2>
        <Link href="/pernah-tampil" className="link-underline text-sm font-medium text-muted-foreground hover:text-foreground">
          Lihat semua penampilan
        </Link>
      </div>
      <Marquee duration={45}>
        {venues.map((v) => (
          <span key={v} className="flex items-center gap-8 pr-8 font-serif text-2xl whitespace-nowrap text-muted-foreground md:text-4xl">
            {v}
            <span aria-hidden="true" className="size-2 rounded-full bg-gold" />
          </span>
        ))}
      </Marquee>
    </section>
  )
}
