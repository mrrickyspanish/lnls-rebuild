"use client";

import { useState } from 'react';
import PodcastHero from '@/components/podcast/PodcastHero';
import EpisodeGrid from '@/components/podcast/EpisodeGrid';
import type { Episode } from '@/lib/podcast';

type PodcastPageClientProps = {
  initialEpisodes: Episode[];
};

export default function PodcastPageClient({ initialEpisodes }: PodcastPageClientProps) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(initialEpisodes[0]);
  const [episodes] = useState<Episode[]>(initialEpisodes);

  const handleEpisodeSelect = (episode: Episode) => {
    setCurrentEpisode(episode);
    // Scroll to player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-8">
      {/* Hero Player */}
      <PodcastHero currentEpisode={currentEpisode} />

      {/* Episode Grid with Filters */}
      <EpisodeGrid 
        episodes={episodes} 
        onEpisodeSelect={handleEpisodeSelect}
        currentEpisodeId={currentEpisode.id}
      />
    </div>
  );
}