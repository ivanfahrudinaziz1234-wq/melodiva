import { ImageResponse } from 'next/og'
import { getMember, site } from '@/lib/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `Personel ${site.bandName}`

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const member = getMember(slug)
  const name = member?.name ?? site.bandName
  const role = member?.role ?? site.tagline

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #8c2f39 0%, #2a0f14 70%, #0e0e10 100%)',
          color: '#f5f1ea',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          {[40, 28, 20, 28, 40].map((h, i) => (
            <div key={i} style={{ width: 16, height: h * 2, borderRadius: 3, background: i % 2 ? '#d9b84a' : '#f5f1ea' }} />
          ))}
          <div style={{ marginLeft: 20, fontSize: 32, letterSpacing: 8 }}>MELODIVA MUSIC</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, letterSpacing: 6, color: '#d9b84a', textTransform: 'uppercase' }}>{role}</div>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, marginTop: 12 }}>{name}</div>
        </div>
        <div style={{ fontSize: 26, opacity: 0.75 }}>{site.city} · Live band untuk wedding, event & party</div>
      </div>
    ),
    size,
  )
}
