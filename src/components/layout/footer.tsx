import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { Ornament } from '@/components/shared/section-heading'
import { SocialIcon } from '@/components/shared/social-icon'
import { site, socials } from '@/lib/content'
import { navItems } from '@/lib/seo'
import { waLink } from '@/lib/whatsapp'

export function Footer() {
  const footerSocials = socials.filter((s) => s.showInFooter)
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card pb-safe">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <Link href="/" aria-label="Melodiva Music — ke beranda" className="self-start">
            <Logo />
          </Link>
          <p className="prose-width text-muted-foreground">{site.description}</p>
          <ul className="flex flex-wrap gap-2" aria-label="Media sosial">
            {footerSocials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary-text"
                >
                  <SocialIcon icon={s.icon} className="size-4" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Menu footer">
          <h2 className="font-serif text-lg font-semibold">Menu</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/faq" className="link-underline inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-serif text-lg font-semibold">Kontak</h2>
          <ul className="mt-4 flex flex-col gap-3 text-muted-foreground">
            <li>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-foreground">
                <SocialIcon icon="whatsapp" className="mt-1 size-4 shrink-0 text-gold-text" />
                <span>WhatsApp: +{site.whatsappNumber}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-start gap-3 hover:text-foreground">
                <Mail className="mt-1 size-4 shrink-0 text-gold-text" aria-hidden="true" />
                <span>{site.email}</span>
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-1 size-4 shrink-0 text-gold-text" aria-hidden="true" />
              <span>
                {site.address}
                <br />
                <span className="text-sm">Melayani: {site.serviceAreas.slice(0, 5).join(', ')} dan sekitarnya</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted-foreground md:flex-row">
          <p>
            © {year} {site.bandName}. Seluruh hak cipta dilindungi.
          </p>
          <Ornament />
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
