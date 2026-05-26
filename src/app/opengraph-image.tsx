import { ImageResponse } from 'next/og'

export const alt = 'Dr.Folio - MTS 캡처 한 장으로 포트폴리오 진단'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1C2B5E',
          color: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            Dr.Folio
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 500,
              lineHeight: 1.3,
              opacity: 0.92,
            }}
          >
            MTS 캡처 한 장으로 포트폴리오 진단
          </div>
        </div>
      </div>
    ),
    size
  )
}
