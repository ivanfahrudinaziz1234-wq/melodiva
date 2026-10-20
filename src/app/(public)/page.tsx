import { AboutIntro } from '@/components/sections/about-intro'
import { ClosingCta } from '@/components/sections/closing-cta'
import { EventTypes } from '@/components/sections/event-types'
import { FaqPreview } from '@/components/sections/faq-preview'
import { GalleryPreview } from '@/components/sections/gallery-preview'
import { Hero } from '@/components/sections/hero'
import { MembersCarousel } from '@/components/sections/members-carousel'
import { Stats } from '@/components/sections/stats'
import { TestimonialSlider } from '@/components/sections/testimonial-slider'
import { VenueMarquee } from '@/components/sections/venue-marquee'
import { VideoFeatured } from '@/components/sections/video-featured'
import { JsonLd } from '@/components/shared/json-ld'
import { members, testimonials } from '@/lib/content'
import { localBusinessLd, musicGroupLd } from '@/lib/seo'

export default function HomePage() {
  return (
    <>
      <JsonLd data={musicGroupLd()} />
      <JsonLd data={localBusinessLd()} />
      <Hero />
      <AboutIntro />
      <Stats />
      <EventTypes />
      <MembersCarousel members={members} />
      <VenueMarquee />
      <GalleryPreview />
      <VideoFeatured />
      <TestimonialSlider items={testimonials} />
      <FaqPreview />
      <ClosingCta />
    </>
  )
}
