import { Suspense } from 'react';
import { Metadata } from 'next';
import PodcastPageClient from '@/components/podcast/PodcastPageClient';

// Fetch episodes from API
async function getEpisodes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/podcast/episodes`, {
    next: { revalidate: 300 }
  });
  
  if (!res.ok) return [];
  const allEpisodes = await res.json();
  // Limit to 10 episodes (2 rows of 5)
  return allEpisodes.slice(0, 10);
}

export const metadata: Metadata = {
  title: 'Podcast | Late Night Lake Show',
  description: 'Listen to the Late Night Lake Show podcast - Lakers news, analysis, and hot takes.',
};

export default async function PodcastPage() {
  const episodes = await getEpisodes();

  if (!episodes || episodes.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--netflix-bg)] pt-[76px]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-0">
          <div className="py-12">
            <p className="text-white/60 text-center">No episodes available</p>
          </div>
        </div>
      </div>
    );
  }

  return <PodcastPageClient initialEpisodes={episodes} />;
}
