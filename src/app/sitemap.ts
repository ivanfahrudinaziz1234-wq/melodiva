import type { MetadataRoute } from 'next'
import { members } from '@/lib/content'
import { absoluteUrl, navItems } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const pages = [...navItems.map((n) => n.href), '/faq']
  return [
    ...pages.map((path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: path === '/' ? 1 : 0.7,
    })),
    ...members.map((m) => ({
      url: absoluteUrl(`/personel/${m.slug}`),
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
