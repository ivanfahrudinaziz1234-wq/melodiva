import { Button, Heading, Section, Text } from '@react-email/components'
import { EmailLayout, SummaryRow, brand } from './email-layout'

export type InquirySummary = {
  refCode: string
  name: string
  whatsapp: string
  email: string
  eventType: string
  eventDate?: string | null
  location?: string | null
  guests?: number | null
  message: string
}

export function AdminAlertEmail({ data, adminUrl }: { data: InquirySummary; adminUrl: string }) {
  return (
    <EmailLayout preview={`Pesan baru dari ${data.name} (${data.refCode})`}>
      <Heading as="h1" style={{ fontFamily: 'Georgia, serif', color: brand.charcoal, fontSize: 22, margin: '0 0 16px' }}>
        Pesan baru dari {data.name}
      </Heading>
      <SummaryRow label="Referensi" value={data.refCode} />
      <SummaryRow label="WhatsApp" value={data.whatsapp} />
      <SummaryRow label="Email" value={data.email} />
      <SummaryRow label="Jenis acara" value={data.eventType} />
      <SummaryRow label="Tanggal" value={data.eventDate} />
      <SummaryRow label="Lokasi" value={data.location} />
      <SummaryRow label="Jumlah tamu" value={data.guests ? String(data.guests) : null} />
      <Section style={{ backgroundColor: brand.ivory, borderRadius: 8, padding: '12px 16px', margin: '16px 0' }}>
        <Text style={{ margin: 0, fontSize: 14, color: brand.charcoal, whiteSpace: 'pre-wrap' }}>{data.message}</Text>
      </Section>
      <Button href={adminUrl} style={{ backgroundColor: brand.maroon, color: brand.ivory, padding: '12px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
        Buka di Inbox Admin
      </Button>
    </EmailLayout>
  )
}
