import type { ReactNode } from 'react'
import { Anton, Inter } from 'next/font/google'
import './globals.css'

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })

export const metadata = {
  title: 'IntuiTV Analytics | Built Different',
  description: 'Real-time analytics dashboard for IntuiTV platform',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body className="bg-brand text-ink font-sans antialiased">{children}</body>
    </html>
  )
}
