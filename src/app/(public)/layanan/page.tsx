import { Check, Clock, Users } from 'lucide-react'
import { StaggerChildren, StaggerItem } from '@/components/motion/fade-in'
import { TiltCard } from '@/components/motion/tilt-card'
import { ClosingCta } from '@/components/sections/closing-cta'
import { PageHero } from '@/components/shared/page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { services, site } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import { cn, formatPrice } from '@/lib/utils'
import { waPackageLink } from '@/lib/whatsapp'

export const metadata = pageMetadata({
  title: 'Layanan & Paket',
  description: `Paket live band ${site.bandName} untuk wedding, event, dan party di ${site.city}. Tanyakan ketersediaan tanggal via WhatsApp.`,
  path: '/layanan',
})

const steps = [
  { title: 'Hubungi kami', description: 'Kirim pesan WhatsApp berisi tanggal, lokasi, dan jenis acara.' },
  { title: 'Cek tanggal & konsultasi', description: 'Kami cek ketersediaan, lalu diskusikan formasi dan daftar lagu.' },
  { title: 'Penawaran & DP', description: 'Anda menerima penawaran resmi. Tanggal terkunci setelah pembayaran DP.' },
  { title: 'Hari H', description: 'Kami datang lebih awal untuk sound check dan tampil sesuai rundown.' },
]

export default function LayananPage() {
  return (
    <>
      <PageHero
        eyebrow="Layanan"
        title="Paket untuk setiap skala acara"
        description="Harga bisa menyesuaikan lokasi, durasi, dan kebutuhan sound. Semua pemesanan dilakukan melalui WhatsApp."
        breadcrumbs={[{ name: 'Layanan', path: '/layanan' }]}
      />

      <section className="container-page py-16 md:py-20">
        <StaggerChildren as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem as="li" key={s.slug}>
              <TiltCard
                className={cn(
                  'relative flex h-full flex-col gap-5 rounded-2xl border bg-card p-7',
                  s.highlight ? 'border-primary shadow-xl shadow-primary/10' : 'border-border',
                )}
              >
                {s.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-[#1a1a1d]">Paling diminati</span>
                )}
                <h2 className="font-serif text-2xl font-semibold">{s.name}</h2>
                <p className="text-muted-foreground">{s.description}</p>
                <p className={cn('font-serif font-semibold text-primary-text', s.priceMode === 'contact' ? 'text-xl' : 'text-3xl')}>{formatPrice(s)}</p>
                <ul className="flex flex-col gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Users className="size-4 text-gold-text" aria-hidden="true" />
                    {s.lineup}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 text-gold-text" aria-hidden="true" />
                    {s.duration}
                  </li>
                </ul>
                <ul className="flex flex-1 flex-col gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
                  {s.facilities.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary-text" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <WhatsAppButton
                  href={waPackageLink(s.name)}
                  label={`Tanya ${s.name}`}
                  variant={s.highlight ? 'primary' : 'outline'}
                  className="[&>a]:w-full"
                />
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
        <p className="mt-8 text-sm text-muted-foreground">
          Harga belum termasuk transportasi di luar {site.city} dan dapat berubah sewaktu-waktu. Tanggal baru terkunci setelah DP diterima.
        </p>
      </section>

      <section className="bg-card py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Cara Memesan" title="Empat langkah sederhana" />
          <StaggerChildren as="ol" className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <StaggerItem as="li" key={step.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6">
                <span className="font-serif text-4xl font-semibold text-gold-text">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <ClosingCta title="Belum yakin paket mana yang cocok?" description="Ceritakan acaranya, kami bantu rekomendasikan formasi dan durasi yang pas." />
    </>
  )
}
