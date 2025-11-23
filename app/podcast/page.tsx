import { Metadata } from 'next';
import PodcastPageClient from '@/components/podcast/PodcastPageClient';
import { fetchPodcastEpisodes } from '@/lib/podcast';

export const metadata: Metadata = {
  title: 'Podcast | The Daily Dribble',
  description: 'Listen to the The Daily Dribble podcast - Lakers news, analysis, and hot takes.',
};

export const revalidate = 300; // Cache for 5 minutes

export default async function PodcastPage() {
  // Fetch episodes directly from library (matches News/Videos pattern)
  const episodes = await fetchPodcastEpisodes(10); // Limit to 10 episodes (2 rows of 5)
  const hasEpisodes = episodes && episodes.length > 0;

  return (
    <>
      <section className="relative bg-gradient-to-t from-background to-transparent pb-8">
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