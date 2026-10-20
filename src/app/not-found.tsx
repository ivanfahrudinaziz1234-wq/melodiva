import Link from 'next/link'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { PianoMark } from '@/components/layout/logo'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'

export const metadata = { title: 'Halaman tidak ditemukan', robots: { index: false } }

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="konten" className="container-page flex min-h-[80svh] flex-col items-center justify-center gap-6 pt-28 pb-16 text-center">
        <PianoMark className="h-16" />
        <p className="font-serif text-7xl font-semibold text-primary-text md:text-9xl">404</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Nada ini sepertinya sumbang</h1>
        <p className="prose-width text-muted-foreground">Halaman yang Anda cari tidak ada atau sudah dipindahkan. Mari kembali ke irama yang benar.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary-hover">
            Kembali ke beranda
          </Link>
          <WhatsAppButton variant="outline" />
        </div>
      </main>
      <Footer />
    </>
  )
}
