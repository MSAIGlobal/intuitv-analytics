import type { ReactNode } from 'react'
import { Anton, Inter } from 'next/font/google'
import './globals.css'

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })

const SITE_URL = 'https://analytics.intuitv.app'
const TITLE = 'IntuiTV Analytics — Realtime media intelligence'
const DESCRIPTION =
  'Realtime media intelligence for the IntuiTV estate: viewership, engagement, content performance and geographic insight — sovereign UK AI.'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | IntuiTV Analytics' },
  description: DESCRIPTION,
  applicationName: 'IntuiTV Analytics',
  keywords: [
    'IntuiTV Analytics', 'media analytics', 'viewership analytics', 'streaming analytics',
    'content performance', 'realtime dashboard', 'MOTHER AI', 'sovereign AI',
  ],
  authors: [{ name: 'Media Stream AI' }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website', locale: 'en_GB', url: SITE_URL, siteName: 'IntuiTV Analytics',
    title: TITLE, description: DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'IntuiTV Analytics — media intelligence' }],
  },
  twitter: { card: 'summary_large_image', site: '@IntuiTV', title: TITLE, description: DESCRIPTION, images: ['/og.png'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' as const } },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body className="bg-brand text-ink font-sans antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'IntuiTV Analytics',
              url: SITE_URL,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: DESCRIPTION,
              publisher: { '@type': 'Organization', name: 'Media Stream AI Limited', url: 'https://www.mediastreamai.com' },
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
