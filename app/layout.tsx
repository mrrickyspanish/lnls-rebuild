import './globals.css'
import { Inter, Anton, IBM_Plex_Sans } from 'next/font/google'
import SiteNav from '@/components/SiteNav'
import Footer from '@/components/Footer'
import { AudioPlayerProvider } from "@/lib/audio/AudioPlayerContext";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";
import ViewTransition from '@/components/ViewTransition';
import { TabProvider } from '@/components/home/HomePageClient';
import { Analytics } from '@vercel/analytics/react';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
// Anton carries the display type. Space Grotesk was only ever used by the old
// home-page CSS, so swapping it keeps the loaded-font count flat.
const anton = Anton({ weight: ['400'], subsets: ['latin'], variable: '--font-anton' })
const ibmPlex = IBM_Plex_Sans({ 
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex'
})

export const metadata = {
  title: 'The Daily Dribble',
  description: 'All-sports perspectives, technology, and the culture around the game. Read The Daily Dribble and listen to Late Night Lake Show.',
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
      <body className={`${inter.variable} ${anton.variable} ${ibmPlex.variable} font-sans min-h-screen flex flex-col`}>
        <ViewTransition />
        <TabProvider>
          <AudioPlayerProvider>
            <SiteNav />
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
