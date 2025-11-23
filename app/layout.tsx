import './globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AudioPlayerProvider } from "@/lib/audio/AudioPlayerContext";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

export const metadata = {
  title: 'The Daily Dribble',
  description: 'Court. Code. Culture.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className={`${inter.variable} ${space.variable} font-sans min-h-screen flex flex-col`}>
        <AudioPlayerProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <GlobalAudioPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  )
}
