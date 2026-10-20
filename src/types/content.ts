import type { z } from 'zod'
import type {
  eventTypeCardSchema,
  eventTypeSchema,
  faqSchema,
  galleryItemSchema,
  historySchema,
  memberSchema,
  performanceSchema,
  serviceSchema,
  siteSchema,
  socialIconSchema,
  socialSchema,
  songSchema,
  statSchema,
  testimonialSchema,
  videoSchema,
} from '@/lib/validators/content'

export type Site = z.infer<typeof siteSchema>
export type Social = z.infer<typeof socialSchema>
export type SocialIcon = z.infer<typeof socialIconSchema>
export type History = z.infer<typeof historySchema>
export type Member = z.infer<typeof memberSchema>
export type Performance = z.infer<typeof performanceSchema>
export type EventType = z.infer<typeof eventTypeSchema>
export type GalleryItem = z.infer<typeof galleryItemSchema>
export type Video = z.infer<typeof videoSchema>
export type Song = z.infer<typeof songSchema>
export type Service = z.infer<typeof serviceSchema>
export type Testimonial = z.infer<typeof testimonialSchema>
export type Faq = z.infer<typeof faqSchema>
export type Stat = z.infer<typeof statSchema>
export type EventTypeCard = z.infer<typeof eventTypeCardSchema>
