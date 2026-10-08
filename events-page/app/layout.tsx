import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Space_Mono, Tiro_Devanagari_Hindi } from 'next/font/google'
import { CursorSparkles } from '@/components/cursor-sparkles'
import { SiteBackground } from '@/components/site-background'
import { SiteNav } from '@/components/site-nav'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
})

const tiro = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: '400',
  variable: '--font-tiro',
})

export const metadata: Metadata = {
  title: 'Events — Trinity | अनुगाथा',
  description:
    'Explore cultural, sports and technical events at Trinity — a journey through the pillars of civilization.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f0b08',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${spaceMono.variable} ${tiro.variable} bg-background`}>
      <body className="font-serif antialiased">
        <SiteBackground />
        <SiteNav />
        {children}
        <CursorSparkles />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
