import './globals.css'
import { Inter, Space_Grotesk, IBM_Plex_Sans } from 'next/font/google'
import ResponsiveHeader from '@/components/ResponsiveHeader'
import Footer from '@/components/Footer'
import { AudioPlayerProvider } from "@/lib/audio/AudioPlayerContext";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";
import ViewTransition from '@/components/ViewTransition';
import dynamic from 'next/dynamic';
import { TabProvider } from '@/components/home/HomePageClient';
import { Analytics } from '@vercel/analytics/react';

// Lazy load SplashScreen for better initial page load
const SplashScreen = dynamic(() => import('@/components/splash/SplashScreen'));

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const ibmPlex = IBM_Plex_Sans({ 
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex'
})

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
      <body className={`${inter.variable} ${space.variable} ${ibmPlex.variable} font-sans min-h-screen flex flex-col`}>
        <SplashScreen />
        <ViewTransition />
        <TabProvider>
          <AudioPlayerProvider>
            <ResponsiveHeader />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <GlobalAudioPlayer />
          </AudioPlayerProvider>
        </TabProvider>
        <Analytics />
      </body>
    </html>
  )
}
