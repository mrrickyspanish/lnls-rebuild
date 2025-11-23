"use client";

import { useState } from 'react';
import PodcastHero from '@/components/podcast/PodcastHero';
import EpisodeGrid from '@/components/podcast/EpisodeGrid';

type Episode = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url?: string;
  published_at: string;
  duration: number;
  episode_number?: number;
  hosts?: string;
  topics?: string[];
};

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