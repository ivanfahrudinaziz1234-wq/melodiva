import { z } from 'zod'

/** Zod schemas for every JSON file in /src/data. Parsed once at build/import time. */

const imagePath = z.string().min(1, 'Image path is required')

export const eventTypeIds = ['wedding', 'event', 'birthday', 'party', 'reguler'] as const
export const eventTypeSchema = z.enum(eventTypeIds)

export const siteSchema = z.object({
  bandName: z.string(),
  shortName: z.string(),
  tagline: z.string(),
  description: z.string(),
  foundedYear: z.number().int(),
  whatsappNumber: z.string().regex(/^62\d{8,13}$/, 'whatsappNumber must start with 62'),
  whatsappDefaultMessage: z.string(),
  email: z.string().email(),
  address: z.string(),
  city: z.string(),
  serviceAreas: z.array(z.string()),
  replyTime: z.string(),
  seo: z.object({
    titleTemplate: z.string(),
    defaultTitle: z.string(),
    defaultDescription: z.string(),
    keywords: z.array(z.string()),
    ogImage: imagePath,
  }),
})

export const socialIconSchema = z.enum(['instagram', 'whatsapp', 'youtube', 'tiktok', 'facebook', 'spotify', 'x', 'link'])

export const socialSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url(),
  icon: socialIconSchema,
  showInHeader: z.boolean(),
  showInFooter: z.boolean(),
  showInContact: z.boolean(),
})

export const historySchema = z.object({
  intro: z.array(z.string()),
  vision: z.string(),
  mission: z.array(z.string()),
  musicStyle: z.string(),
  values: z.array(z.object({ icon: z.string(), title: z.string(), description: z.string() })),
  timeline: z.array(
    z.object({ year: z.number().int(), title: z.string(), description: z.string(), image: imagePath.optional() }),
  ),
})

export const memberSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  nickname: z.string().optional(),
  role: z.string(),
  instrument: z.enum(['keyboard', 'drum', 'guitar', 'bass', 'vocal']),
  photo: imagePath,
  heroPhoto: imagePath,
  shortBio: z.string(),
  bio: z.array(z.string()),
  quote: z.string(),
  quickFacts: z.array(z.object({ label: z.string(), value: z.string() })),
  skills: z.array(z.string()),
  portfolio: z.array(z.object({ year: z.number().int(), title: z.string(), description: z.string() })),
  gallery: z.array(z.object({ src: imagePath, alt: z.string() })),
  socials: z.array(z.object({ platform: socialIconSchema, url: z.string().url() })),
})

export const performanceSchema = z.object({
  id: z.string(),
  venue: z.string(),
  city: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  eventType: eventTypeSchema,
  description: z.string(),
  photos: z.array(imagePath),
  featured: z.boolean(),
})

export const galleryItemSchema = z.object({
  id: z.string(),
  src: imagePath,
  alt: z.string(),
  category: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export const videoSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['youtube', 'local']),
    youtubeId: z.string().regex(/^[\w-]{11}$/).optional(),
    src: z.string().optional(),
    thumbnail: imagePath,
    category: z.string(),
    featured: z.boolean(),
  })
  .refine((v) => (v.type === 'youtube' ? !!v.youtubeId : !!v.src), {
    message: 'YouTube videos need youtubeId, local videos need src',
  })

export const songSchema = z.object({ title: z.string(), artist: z.string(), genre: z.string() })

export const serviceSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    description: z.string(),
    lineup: z.string(),
    duration: z.string(),
    facilities: z.array(z.string()),
    priceMode: z.enum(['fixed', 'starting', 'contact']),
    price: z.number().nonnegative().optional(),
    highlight: z.boolean().optional(),
  })
  .refine((s) => s.priceMode === 'contact' || typeof s.price === 'number', {
    message: 'price is required when priceMode is fixed or starting',
  })

export const testimonialSchema = z.object({ id: z.string(), name: z.string(), event: z.string(), quote: z.string() })
export const faqSchema = z.object({ id: z.string(), question: z.string(), answer: z.string() })
export const statSchema = z.object({ id: z.string(), label: z.string(), value: z.number(), suffix: z.string() })
export const eventTypeCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
})
