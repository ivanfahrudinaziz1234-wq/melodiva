import { Clock, Mail, MapPin, MessageSquareDashed } from 'lucide-react'
import { ContactForm } from '@/components/contact/contact-form'
import { FadeIn, SlideIn } from '@/components/motion/fade-in'
import { env, features } from '@/lib/env'
import { JsonLd } from '@/components/shared/json-ld'
import { PageHero } from '@/components/shared/page-hero'
import { SocialIcon } from '@/components/shared/social-icon'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { site, socials } from '@/lib/content'
import { localBusinessLd, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Kontak',
  description: `Hubungi ${site.bandName} via WhatsApp untuk cek tanggal dan penawaran. Melayani ${site.serviceAreas.slice(0, 4).join(', ')} dan sekitarnya.`,
  path: '/kontak',
})

export default function KontakPage() {
  const contactSocials = socials.filter((s) => s.showInContact && s.icon !== 'whatsapp')

  return (
    <>
      <JsonLd data={localBusinessLd()} />
      <PageHero
        eyebrow="Kontak"
        title="Mari bicarakan acara Anda"
        description={`Cara tercepat adalah WhatsApp. Kami biasanya membalas ${site.replyTime}.`}
        breadcrumbs={[{ name: 'Kontak', path: '/kontak' }]}
      />
      <section className="container-page grid gap-8 py-16 md:py-20 lg:grid-cols-[1fr_1.1fr]">
        <SlideIn direction="left" className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-2xl bg-primary p-8 text-primary-foreground md:p-10">
            <h2 className="font-serif text-3xl font-semibold">WhatsApp</h2>
            <p className="text-primary-foreground/85">Sertakan tanggal, lokasi, dan jenis acara agar kami bisa langsung cek ketersediaan.</p>
            <p className="font-serif text-2xl">+{site.whatsappNumber}</p>
            <WhatsAppButton variant="light" size="lg" label="Chat sekarang" className="self-start" />
          </div>
          <ul className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8">
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-gold-text" aria-hidden="true" />
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-gold-text" aria-hidden="true" />
              Waktu balas: {site.replyTime}
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold-text" aria-hidden="true" />
              {site.address}
            </li>
          </ul>
          {contactSocials.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Media sosial">
              {contactSocials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent">
                    <SocialIcon icon={s.icon} className="size-4" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </SlideIn>

        <div className="flex flex-col gap-6">
          {features.database ? (
            <FadeIn>
              <ContactForm turnstileSiteKey={features.turnstile ? env.NEXT_PUBLIC_TURNSTILE_SITE_KEY : undefined} />
            </FadeIn>
          ) : (
            <FadeIn className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border p-10 text-center">
              <MessageSquareDashed className="size-10 text-muted-foreground" aria-hidden="true" />
              <h2 className="font-serif text-2xl font-semibold">Formulir pertanyaan</h2>
              <p className="prose-width text-muted-foreground">
                Formulir belum dikonfigurasi. Sementara ini, silakan hubungi kami langsung lewat WhatsApp — kami akan segera membalas.
              </p>
              <WhatsAppButton variant="outline" label="Kirim pesan via WhatsApp" />
            </FadeIn>
          )}
          <FadeIn delay={0.1} className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-serif text-2xl font-semibold">Area layanan</h2>
            <p className="mt-2 text-muted-foreground">Berbasis di {site.city}, kami siap tampil di:</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {site.serviceAreas.map((a) => (
                <li key={a} className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary-text">
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">Di luar area ini? Tetap hubungi kami, biaya transportasi akan diinformasikan.</p>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
