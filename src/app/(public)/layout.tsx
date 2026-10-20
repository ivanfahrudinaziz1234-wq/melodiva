import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { BackToTop } from '@/components/layout/back-to-top'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { LoadingScreen } from '@/components/layout/loading-screen'
import { WhatsAppFloat } from '@/components/layout/whatsapp-float'
import { PageTransition } from '@/components/motion/page-transition'
import { ScrollProgress } from '@/components/motion/scroll-progress'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground"
      >
        Lompat ke konten
      </a>
      <LoadingScreen />
      <ScrollProgress />
      <Header />
      <main id="konten">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      <PageViewTracker />
    </>
  )
}
