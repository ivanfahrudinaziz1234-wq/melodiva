import type { Metadata } from 'next'
import { faqs, members, site, socials } from '@/lib/content'
import { siteUrl } from '@/lib/utils'

export const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/personel', label: 'Personel' },
  { href: '/pernah-tampil', label: 'Pernah Tampil' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/video', label: 'Video' },
  { href: '/layanan', label: 'Layanan' },
  { href: '/lagu', label: 'Lagu' },
  { href: '/kontak', label: 'Kontak' },
] as const

export function absoluteUrl(path = '/') {
  return `${siteUrl}${path === '/' ? '' : path}`
}

/** Per-page metadata with canonical, Open Graph and Twitter card in one call. */
export function pageMetadata({
  title,
  description,
  path,
  image = site.seo.ogImage,
}: {
  title: string
  description: string
  path: string
  image?: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      siteName: site.bandName,
      url: path,
      title: `${title} | ${site.bandName}`,
      description,
      images: [{ url: image, alt: `${title} — ${site.bandName}` }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${site.bandName}`, description, images: [image] },
  }
}

export function musicGroupLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `${siteUrl}/#band`,
    name: site.bandName,
    alternateName: site.shortName,
    description: site.description,
    url: siteUrl,
    image: absoluteUrl(site.seo.ogImage),
    foundingDate: String(site.foundedYear),
    foundingLocation: { '@type': 'Place', name: site.city },
    genre: ['Pop', 'Jazz', 'Dangdut', 'Campursari', 'Rock'],
    sameAs: socials.filter((s) => s.icon !== 'whatsapp').map((s) => s.url),
    member: members.map((m) => ({
      '@type': 'OrganizationRole',
      roleName: m.role,
      member: { '@type': 'Person', name: m.name, url: absoluteUrl(`/personel/${m.slug}`) },
    })),
  }
}

export function localBusinessLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'EntertainmentBusiness'],
    '@id': `${siteUrl}/#business`,
    name: site.bandName,
    description: site.seo.defaultDescription,
    url: siteUrl,
    image: absoluteUrl(site.seo.ogImage),
    telephone: `+${site.whatsappNumber}`,
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: 'DI Yogyakarta', addressCountry: 'ID' },
    areaServed: site.serviceAreas.map((name) => ({ '@type': 'City', name })),
    priceRange: 'Rp',
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Beranda', path: '/' }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqPageLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}
