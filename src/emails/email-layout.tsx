import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components'

export const brand = {
  maroon: '#7A1F2B',
  charcoal: '#1F1D1B',
  ivory: '#FAF7F2',
  gold: '#B8913B',
  muted: '#6B6560',
}

export function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html lang="id">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.ivory, margin: 0, padding: '24px 0', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ maxWidth: 560, width: '100%', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
          <Section style={{ backgroundColor: brand.maroon, padding: '20px 28px' }}>
            <Text style={{ margin: 0, color: brand.ivory, fontSize: 20, fontFamily: 'Georgia, serif', letterSpacing: 0.5 }}>
              Melodiva <span style={{ color: brand.gold }}>Music</span>
            </Text>
          </Section>
          <Section style={{ padding: '28px' }}>{children}</Section>
          <Hr style={{ borderColor: '#EEE7DC', margin: 0 }} />
          <Section style={{ padding: '16px 28px' }}>
            <Text style={{ margin: 0, color: brand.muted, fontSize: 12 }}>Melodiva Music · Band Wedding & Event Yogyakarta</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <Text style={{ margin: '0 0 6px', fontSize: 14, color: brand.charcoal }}>
      <strong style={{ color: brand.muted, fontWeight: 600 }}>{label}:</strong> {value}
    </Text>
  )
}
