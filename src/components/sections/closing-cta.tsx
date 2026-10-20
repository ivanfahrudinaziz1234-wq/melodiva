import { FadeIn } from '@/components/motion/fade-in'
import { MagneticButton } from '@/components/motion/magnetic-button'
import { TextReveal } from '@/components/motion/text-reveal'
import { Ornament } from '@/components/shared/section-heading'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { site } from '@/lib/content'

export function ClosingCta({
  title = 'Tanggal acara Anda sudah ditentukan?',
  description = `Kirim detail acara lewat WhatsApp. Kami biasanya membalas ${site.replyTime}.`,
}: {
  title?: string
  description?: string
}) {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#6d2430] to-[#2a0f14] px-6 py-16 text-center text-primary-foreground md:px-16 md:py-24">
        <div aria-hidden="true" className="grain absolute inset-0 opacity-10 mix-blend-overlay" />
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-72 rounded-full bg-[#d9b84a]/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6">
          <TextReveal as="h2" text={title} className="max-w-3xl text-balance text-3xl font-semibold md:text-5xl" />
          <Ornament />
          <FadeIn delay={0.2}>
            <p className="prose-width text-pretty text-lg text-primary-foreground/85">{description}</p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <MagneticButton>
              <WhatsAppButton variant="light" size="lg" />
            </MagneticButton>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
