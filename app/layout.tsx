import './globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import ResponsiveHeader from '@/components/ResponsiveHeader'
import Footer from '@/components/Footer'
import { AudioPlayerProvider } from "@/lib/audio/AudioPlayerContext";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";
import SplashScreen from '@/components/splash/SplashScreen'

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
        <link rel="icon" type="image/png" href="/uploads/articles/dribbles_favicon_1.png" />
      </head>
      <body className={`${inter.variable} ${space.variable} font-sans min-h-screen flex flex-col`}>
        <SplashScreen />
        <AudioPlayerProvider>
          <ResponsiveHeader />
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
