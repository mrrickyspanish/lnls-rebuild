"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

type Episode = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url?: string;
  published_at: string;
  duration: number;
  episode_number?: number;
  topics?: string[];
};

type EpisodeGridProps = {
  episodes: Episode[];
  onEpisodeSelect: (episode: Episode) => void;
  currentEpisodeId: string;
};

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
}

type EpisodeCardProps = {
  episode: Episode;
  onClick: () => void;
  isCurrentlyPlaying: boolean;
};

function EpisodeCard({ episode, onClick, isCurrentlyPlaying }: EpisodeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Card */}
      <div className="relative h-[450px] rounded-lg overflow-hidden bg-[var(--netflix-bg)] shadow-2xl">
        {/* Image */}
        {episode.image_url ? (
          <Image
            src={episode.image_url}
            alt={episode.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-yellow-900 flex items-center justify-center">
            <span className="text-white/20 text-6xl font-bold">TDD</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Play Button on Hover or Current Playing Indicator */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: (isHovered || isCurrentlyPlaying) ? 1 : 0,
            opacity: (isHovered || isCurrentlyPlaying) ? 1 : 0 
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center shadow-2xl ${
            isCurrentlyPlaying 
              ? 'bg-[var(--netflix-red)] animate-pulse' 
              : 'bg-white/95'
          }`}>
            <Play className={`w-8 h-8 fill-current ml-1 ${
              isCurrentlyPlaying ? 'text-white' : 'text-black'
            }`} />
          </div>
        </motion.div>

        {/* Metadata Inside Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
          {/* Episode Number & Date */}
          <div className="flex items-center gap-2 text-xs text-white/80">
            {episode.episode_number && (
              <>
                <span className="font-bold text-[var(--netflix-red)]">
                  Ep {episode.episode_number}
                </span>
                <span>•</span>
              </>
            )}
            <span>{formatDate(episode.published_at)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(episode.duration)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white leading-tight font-netflix line-clamp-2 text-sm md:text-base">
            {episode.title}
          </h3>

          {/* Topics */}
          {episode.topics && episode.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {episode.topics.slice(0, 2).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function EpisodeGrid({ episodes, onEpisodeSelect, currentEpisodeId }: EpisodeGridProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Extract all unique topics
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    episodes.forEach(ep => {
      ep.topics?.forEach(topic => topics.add(topic));
    });
    return ['All', ...Array.from(topics).sort()];
  }, [episodes]);

  // Filter episodes
  const filteredEpisodes = useMemo(() => {
    if (selectedFilter === 'All') return episodes;
    return episodes.filter(ep => ep.topics?.includes(selectedFilter));
  }, [episodes, selectedFilter]);

  const handleEpisodeClick = (episode: Episode) => {
    onEpisodeSelect(episode);
  };

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white font-netflix">
          All Episodes
        </h2>
        <span className="text-white/60 text-sm">
          {filteredEpisodes.length} {filteredEpisodes.length === 1 ? 'episode' : 'episodes'}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedFilter(topic)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === topic
                ? 'bg-[var(--netflix-red)] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Episode Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredEpisodes.map((episode) => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            onClick={() => handleEpisodeClick(episode)}
            isCurrentlyPlaying={episode.id === currentEpisodeId}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredEpisodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">
            No episodes found for "{selectedFilter}"
          </p>
        </div>
      )}
    </section>
  );
}