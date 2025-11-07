import { AudioPlayerProvider } from "@/lib/audio/AudioPlayerContext";
import PersistentAudioPlayer from "@/components/PersistentAudioPlayer";
import Header from '@/components/Header'
import type { Metadata } from "next";
import "./globals.css";
import "./styles/theme.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Late Night Lake Show — Stories in Motion",
  description: "Lakers, culture, and basketball told through motion and story. A dynamic editorial experience about the NBA, Los Angeles, and the voices driving basketball culture forward.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add preconnects for performance */}
        <link rel="preconnect" href="https://www.spreaker.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body className={inter.className + ' bg-black text-white'}>
        <AudioPlayerProvider>
          <Header />
          {children}
          <PersistentAudioPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}