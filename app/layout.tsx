import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AudioPlayerProvider } from '@/lib/audio/AudioPlayerContext'
import GlobalAudioPlayer from '@/components/audio/GlobalAudioPlayer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Late Night Lake Show | Where Lakers Fans Stay Up Talking Ball',
    template: '%s | LNLS',
  },
  description:
    'Full-scale Lakers and NBA content hub — daily news, podcasts, videos, and culture coverage by basketball lifers.',
  keywords: [
    'Lakers',
    'NBA',
    'Lakers podcast',
    'Lakers news',
    'basketball',
    'Late Night Lake Show',
    'LNLS',
  ],
  authors: [{ name: 'Late Night Lake Show' }],
  creator: 'Late Night Lake Show',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Late Night Lake Show',
    title: 'Late Night Lake Show | Where Lakers Fans Stay Up Talking Ball',
    description:
      'Full-scale Lakers and NBA content hub — daily news, podcasts, videos, and culture coverage.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Late Night Lake Show',
    description: 'Where Lakers fans stay up talking ball.',
    creator: '@latenightlakeshow',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--netflix-bg)]">
        <AudioPlayerProvider>
          <Header />
          <main className="flex-grow pb-24">{children}</main>
          <Footer />
          <GlobalAudioPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  )
}
