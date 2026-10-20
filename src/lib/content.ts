import { z } from 'zod'
import siteJson from '@/data/site.json'
import socialsJson from '@/data/socials.json'
import historyJson from '@/data/history.json'
import membersJson from '@/data/members.json'
import performancesJson from '@/data/performances.json'
import galleryJson from '@/data/gallery.json'
import videosJson from '@/data/videos.json'
import songsJson from '@/data/songs.json'
import servicesJson from '@/data/services.json'
import testimonialsJson from '@/data/testimonials.json'
import faqJson from '@/data/faq.json'
import statsJson from '@/data/stats.json'
import eventTypesJson from '@/data/event-types.json'
import {
  eventTypeCardSchema,
  faqSchema,
  galleryItemSchema,
  historySchema,
  memberSchema,
  performanceSchema,
  serviceSchema,
  siteSchema,
  socialSchema,
  songSchema,
  statSchema,
  testimonialSchema,
  videoSchema,
} from '@/lib/validators/content'

/**
 * Parses a JSON data file and throws a readable error naming the file,
 * so a typo in /src/data breaks the build instead of the live site.
 */
function load<T extends z.ZodType>(file: string, schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid content in src/data/${file}:\n${z.prettifyError(result.error)}`)
  }
  return result.data
}

const rawSite = load('site.json', siteSchema, siteJson)

export const site = {
  ...rawSite,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || rawSite.whatsappNumber,
}
export const socials = load('socials.json', z.array(socialSchema), socialsJson)
export const history = load('history.json', historySchema, historyJson)
export const members = load('members.json', z.array(memberSchema), membersJson)
export const performances = load('performances.json', z.array(performanceSchema), performancesJson).sort(
  (a, b) => b.date.localeCompare(a.date),
)
export const gallery = load('gallery.json', z.array(galleryItemSchema), galleryJson)
export const videos = load('videos.json', z.array(videoSchema), videosJson)
export const songs = load('songs.json', z.array(songSchema), songsJson)
export const services = load('services.json', z.array(serviceSchema), servicesJson)
export const testimonials = load('testimonials.json', z.array(testimonialSchema), testimonialsJson)
export const faqs = load('faq.json', z.array(faqSchema), faqJson)
export const stats = load('stats.json', z.array(statSchema), statsJson)
export const eventTypeCards = load('event-types.json', z.array(eventTypeCardSchema), eventTypesJson)

export function getMember(slug: string) {
  return members.find((m) => m.slug === slug)
}

export function getNextMember(slug: string) {
  const index = members.findIndex((m) => m.slug === slug)
  return members[(index + 1) % members.length]
}

export const eventTypeLabels: Record<string, string> = {
  wedding: 'Wedding',
  event: 'Event',
  birthday: 'Birthday',
  party: 'Party',
  reguler: 'Reguler',
  lainnya: 'Lainnya',
  panggung: 'Panggung',
  jamming: 'Jamming',
}
