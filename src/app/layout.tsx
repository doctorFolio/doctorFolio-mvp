// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

const title = 'Dr.Folio'
const description = 'MTS 캡처 한 장으로 포트폴리오 진단'
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
const metadataBase = new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`)
const openGraphImagePath = '/opengraph-image'

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  openGraph: {
    title,
    description,
    images: [openGraphImagePath],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [openGraphImagePath],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
