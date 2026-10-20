import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Quote } from 'lucide-react'
import { FadeIn, SlideIn, StaggerChildren, StaggerItem } from '@/components/motion/fade-in'
import { GalleryGrid } from '@/components/shared/gallery-grid'
import { NextCue } from '@/components/shared/next-cue'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { SocialIcon } from '@/components/shared/social-icon'
import { JsonLd } from '@/components/shared/json-ld'
import { getMember, getNextMember, members, site } from '@/lib/content'
import { absoluteUrl, pageMetadata } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return members.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: PageProps<'/personel/[slug]'>) {
  const { slug } = await params
  const member = getMember(slug)
  if (!member) return {}
  const meta = pageMetadata({
    title: `${member.name} — ${member.role}`,
    description: member.shortBio,
    path: `/personel/${member.slug}`,
  })
  // Drop config images so the colocated opengraph-image.tsx route supplies them.
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: undefined },
    twitter: { ...meta.twitter, images: undefined },
  }
}

export default async function MemberPage({ params }: PageProps<'/personel/[slug]'>) {
  const { slug } = await params
  const member = getMember(slug)
  if (!member) notFound()
  const next = getNextMember(slug)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: member.name,
          jobTitle: member.role,
          image: absoluteUrl(member.photo),
          url: absoluteUrl(`/personel/${member.slug}`),
          memberOf: { '@type': 'MusicGroup', name: site.bandName, url: absoluteUrl('/') },
          sameAs: member.socials.map((s) => s.url),
        }}
      />
      <PageHero
        eyebrow={member.role}
        title={member.name}
        description={member.shortBio}
        breadcrumbs={[
          { name: 'Personel', path: '/personel' },
          { name: member.nickname ?? member.name, path: `/personel/${member.slug}` },
        ]}
      />

      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1.3fr]">
        <SlideIn direction="left" className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted">
            <Image src={member.heroPhoto} alt={`Potret ${member.name}`} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {member.quickFacts.map((f) => (
              <div key={f.label} className="rounded-xl border border-border bg-card p-4">
                <dt className="text-sm text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </SlideIn>

        <div className="flex flex-col gap-12">
          <FadeIn as="article" className="flex flex-col gap-5 text-lg text-muted-foreground">
            {member.bio.map((p) => (
              <p key={p.slice(0, 24)} className="text-pretty">
                {p}
              </p>
            ))}
          </FadeIn>

          <FadeIn className="relative rounded-2xl bg-primary p-8 text-primary-foreground">
            <Quote className="size-8 text-[#d9b84a]" aria-hidden="true" />
            <blockquote className="mt-4 font-serif text-2xl text-balance">“{member.quote}”</blockquote>
          </FadeIn>

          <div>
            <h2 className="font-serif text-2xl font-semibold">Keahlian</h2>
            <StaggerChildren as="ul" className="mt-4 flex flex-wrap gap-2">
              {member.skills.map((s) => (
                <StaggerItem as="li" key={s} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
                  {s}
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          {member.portfolio.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl font-semibold">Perjalanan musik</h2>
              <ol className="mt-6 ml-2 border-l-2 border-gold/40">
                {member.portfolio.map((p) => (
                  <li key={`${p.year}-${p.title}`} className="relative pb-8 pl-6">
                    <span aria-hidden="true" className="absolute top-2 -left-[7px] size-3 rounded-full bg-primary" />
                    <span className="font-semibold text-primary-text">{p.year}</span>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-muted-foreground">{p.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {member.socials.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={`Media sosial ${member.name}`}>
              {member.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium capitalize hover:bg-accent">
                    <SocialIcon icon={s.platform} className="size-4" />
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {member.gallery.length > 0 && (
        <section className="container-page pb-10">
          <SectionHeading title={`Momen ${member.nickname ?? member.name}`} />
          <div className="mt-10">
            <GalleryGrid items={member.gallery.map((g, i) => ({ id: `${member.slug}-${i}`, ...g, width: 1200, height: 900 }))} />
          </div>
        </section>
      )}

      {next && next.slug !== member.slug && (
        <NextCue href={`/personel/${next.slug}`} label={`Berikutnya: ${next.name}`} description={next.role} />
      )}
    </>
  )
}
