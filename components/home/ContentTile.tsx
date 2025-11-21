"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play, Mic2, Plus } from "lucide-react";
import { detectTopic, AccentColors, getCategoryBadge } from "@/lib/theme/tokens";
import { useState } from "react";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";

type ContentTileProps = {
  id: string;
  title: string;
  image_url?: string | null;
  content_type?: string;
  source?: string;
  source_url?: string | null;
  published_at?: string | null;
  duration?: string;
  excerpt?: string;
  episode_number?: number;
  audio_url?: string;
  episodeQueue?: any[];
};

function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Use UTC to ensure server/client consistency
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

export default function ContentTile({
  id,
  title,
  image_url,
  content_type,
  source,
  source_url,
  published_at,
  duration,
  excerpt,
  episode_number,
  audio_url,
  episodeQueue = [],
}: ContentTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { playEpisode, currentEpisode, isPlaying } = useAudioPlayer();
  
  const topic = detectTopic({ title, content_type, source });
  const accent = AccentColors[topic];
  const badge = getCategoryBadge(topic);
  const href = source_url || "#";
  const isPodcast = content_type === "podcast";
  const isVideo = content_type === "video";

  const isCurrentlyPlaying = currentEpisode?.id === id && isPlaying;

  // Handle podcast click
  const handlePodcastClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPodcast && (audio_url || source_url)) {
      const podcastEpisodes = episodeQueue
        .filter(item => item.content_type === 'podcast')
        .map(item => ({
          id: item.id,
          title: item.title,
          audio_url: item.audio_url || item.source_url,
          image_url: item.image_url || undefined,
          episode_number: item.episode_number,
        }));
        
      playEpisode({
        id,
        title,
        audio_url: audio_url || source_url!,
        image_url: image_url || undefined,
        episode_number,
      }, podcastEpisodes);
    }
  };

  const cardContent = (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="group cursor-pointer h-full flex flex-col"
    >
      {/* Thumbnail - Portrait layout */}
      <div className="relative h-[450px] rounded-lg overflow-hidden bg-slate-900">
        {image_url ? (
          <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-6xl text-white/10">{badge.icon}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Duration Badge */}
        {duration && !isCurrentlyPlaying && (
          <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
            {isPodcast ? `${Math.floor(parseInt(duration) / 60)}m` : duration}
          </div>
        )}

        {/* Play Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center shadow-2xl ring-2 ${
                isCurrentlyPlaying 
                  ? 'bg-[var(--netflix-red)] ring-[var(--netflix-red)]/50 animate-pulse' 
                  : 'bg-white/95 ring-white/50'
              }`}>
                {isPodcast ? (
                  <Mic2 className={`w-7 h-7 ${isCurrentlyPlaying ? 'text-white' : 'text-slate-900'}`} />
                ) : (
                  <Play className={`w-7 h-7 fill-current ml-1 ${isCurrentlyPlaying ? 'text-white' : 'text-slate-900'}`} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isHovered ? 0 : 1 }}
            className="px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md"
            style={{
              backgroundColor: `${accent.primary}30`,
              color: accent.primary,
              border: `1px solid ${accent.primary}60`,
            }}
          >
            {badge.label}
          </motion.div>
        </div>

        {/* Now Playing Indicator */}
        {isCurrentlyPlaying && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--netflix-red)] px-2 py-1 rounded-full">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-bold text-white">Playing</span>
          </div>
        )}

        {/* METADATA INSIDE CARD - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5">
          {/* Episode/Duration Line */}
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
            {episode_number && <span>Episode {episode_number}</span>}
            {duration && episode_number && <span>•</span>}
            {duration && <span>{isPodcast ? `${Math.floor(parseInt(duration) / 60)} min` : duration}</span>}
          </div>

          {/* Title - Large & Bold */}
          <h3 className="text-base md:text-lg font-bold text-white group-hover:text-[var(--netflix-red)] transition-colors leading-tight line-clamp-3 font-netflix">
            {title}
          </h3>

          {/* Date - Small & Subtle */}
          {published_at && (
            <p className="text-xs text-white/60">
              {formatDate(published_at)}
            </p>
          )}
          
          {/* Progress Bar - Simulated playback progress */}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--netflix-red)] rounded-full transition-all duration-300" 
              style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }} 
            />
          </div>
        </div>

        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && !isPodcast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
              className="absolute top-2 right-2 flex gap-2"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 hover:scale-110 transition-all group/btn"
              >
                <Plus className="w-4 h-4 text-white group-hover/btn:text-slate-900" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // For podcasts with audio, make entire card clickable to play
  if (isPodcast && (audio_url || source_url)) {
    return (
      <div onClick={handlePodcastClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  // For other content, use Link
  return (
    <Link href={href} target={href.startsWith("http") ? "_blank" : "_self"}>
      {cardContent}
    </Link>
  );
}