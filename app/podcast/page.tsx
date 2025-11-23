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
  title: 'Podcast | The Daily Dribble',
  description: 'Listen to the The Daily Dribble podcast - Lakers news, analysis, and hot takes.',
};

export default async function PodcastPage() {
  const episodes = await getEpisodes();
  const hasEpisodes = episodes && episodes.length > 0;

  return (
    <>
      <section className="relative bg-gradient-to-t from-background to-transparent pb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24 md:pt-32">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
            Podcasts
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-[var(--text-secondary)] max-w-xl">
            Late nights. Real talk.
          </p>
        </div>
      </section>

      <section className="bg-[var(--netflix-bg)] py-20 px-6">
        <div className="max-w-[1920px] mx-auto px-4 md:px-0">
          {hasEpisodes ? (
            <PodcastPageClient initialEpisodes={episodes} />
          ) : (
            <div className="py-12 text-center text-[var(--text-secondary)]">
              No episodes available. Check back soon.
            </div>
          )}
        </div>
      </section>
    </>
  );
}