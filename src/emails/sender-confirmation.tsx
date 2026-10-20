import { Button, Heading, Section, Text } from '@react-email/components'
import type { InquirySummary } from './admin-alert'
import { EmailLayout, SummaryRow, brand } from './email-layout'

export function SenderConfirmationEmail({ data, replyTime, waUrl }: { data: InquirySummary; replyTime: string; waUrl: string }) {
  return (
    <EmailLayout preview={`Pesan Anda sudah kami terima (${data.refCode})`}>
      <Heading as="h1" style={{ fontFamily: 'Georgia, serif', color: brand.charcoal, fontSize: 22, margin: '0 0 12px' }}>
        Pesan Anda sudah kami terima
      </Heading>
      <Text style={{ fontSize: 15, color: brand.charcoal, lineHeight: '24px' }}>
        Halo {data.name}, terima kasih sudah menghubungi Melodiva. Kami akan membalas {replyTime}.
      </Text>
      <Section style={{ border: `1px solid ${brand.gold}`, borderRadius: 8, padding: '12px 16px', margin: '16px 0' }}>
        <Text style={{ margin: 0, fontSize: 13, color: brand.muted }}>Nomor referensi</Text>
        <Text style={{ margin: '4px 0 0', fontSize: 20, color: brand.maroon, fontWeight: 700, letterSpacing: 1 }}>{data.refCode}</Text>
      </Section>
      <SummaryRow label="Jenis acara" value={data.eventType} />
      <SummaryRow label="Tanggal" value={data.eventDate} />
      <SummaryRow label="Lokasi" value={data.location} />
      <SummaryRow label="Jumlah tamu" value={data.guests ? String(data.guests) : null} />
      <Section style={{ backgroundColor: brand.ivory, borderRadius: 8, padding: '12px 16px', margin: '16px 0' }}>
        <Text style={{ margin: 0, fontSize: 14, color: brand.charcoal, whiteSpace: 'pre-wrap' }}>{data.message}</Text>
      </Section>
      <Text style={{ fontSize: 14, color: brand.charcoal }}>Butuh jawaban lebih cepat? Lanjutkan percakapan lewat WhatsApp.</Text>
      <Button href={waUrl} style={{ backgroundColor: brand.maroon, color: brand.ivory, padding: '12px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
        Lanjut via WhatsApp
      </Button>
    </EmailLayout>
  )
}
