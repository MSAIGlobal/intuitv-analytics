import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'IntuiTV Analytics | Dashboard',
  description: 'Real-time analytics dashboard for IntuiTV platform',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0A0F1E] text-white antialiased">{children}</body>
    </html>
  )
}
