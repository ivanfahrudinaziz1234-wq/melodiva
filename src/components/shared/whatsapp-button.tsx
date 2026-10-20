import { Ripple } from '@/components/motion/magnetic-button'
import { SocialIcon } from '@/components/shared/social-icon'
import { cn } from '@/lib/utils'
import { waLink } from '@/lib/whatsapp'

/** Primary text-labelled WhatsApp CTA. Pass `href` for custom prefilled messages. */
export function WhatsAppButton({
  label = 'Hubungi via WhatsApp',
  href = waLink(),
  variant = 'primary',
  size = 'md',
  className,
}: {
  label?: string
  href?: string
  variant?: 'primary' | 'outline' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <Ripple className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
          size === 'sm' && 'min-h-10 px-4 text-sm',
          size === 'md' && 'min-h-12 px-6 text-base',
          size === 'lg' && 'min-h-14 px-8 text-lg',
          variant === 'primary' && 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover',
          variant === 'outline' && 'border border-border bg-transparent text-foreground hover:bg-accent',
          variant === 'light' && 'bg-[#f5f1ea] text-[#1a1a1d] hover:bg-white',
        )}
      >
        <SocialIcon icon="whatsapp" className="size-5" />
        {label}
        <span className="sr-only"> (membuka WhatsApp di tab baru)</span>
      </a>
    </Ripple>
  )
}
