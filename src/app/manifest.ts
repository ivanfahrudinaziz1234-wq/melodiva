import type { MetadataRoute } from 'next'
import { site } from '@/lib/content'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.bandName,
    short_name: site.shortName,
    description: site.seo.defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#0E0E10',
    theme_color: '#8C2F39',
    lang: 'id',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
