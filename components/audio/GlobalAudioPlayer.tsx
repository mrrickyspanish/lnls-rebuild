"use client";

import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function GlobalAudioPlayer() {
  const { 
    currentEpisode, 
    isPlaying, 
    progress, 
    duration, 
    volume, 
    togglePlay, 
    seek, 
    setVolume, 
    nextEpisode, 
    prevEpisode, 
    hasNext, 
    hasPrev 
  } = useAudioPlayer();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!currentEpisode) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.8);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-white/10"
      >
        {/* Progress Bar */}
        <div className="relative h-1 bg-white/20 group cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = x / rect.width;
          seek(percent * duration);
        }}>
          <motion.div
            className="h-full bg-[var(--netflix-red)]"
            style={{ width: `${progressPercent}%` }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Player Controls */}
        <div className="px-4 py-3 flex items-center gap-4">
          {/* Episode Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentEpisode.image_url && (
              <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={currentEpisode.image_url}
                  alt={currentEpisode.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm truncate">
                {currentEpisode.title}
              </h4>
              <p className="text-[var(--netflix-muted)] text-xs">
                {currentEpisode.episode_number && `Episode ${currentEpisode.episode_number}`}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={prevEpisode}
              disabled={!hasPrev}
              className={`transition-colors ${
                hasPrev 
                  ? 'text-white/70 hover:text-white' 
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-current" />
              ) : (
                <Play className="w-5 h-5 text-black fill-current ml-0.5" />
              )}
            </button>

            <button 
              onClick={nextEpisode}
              disabled={!hasNext}
              className={`transition-colors ${
                hasNext 
                  ? 'text-white/70 hover:text-white' 
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-2 text-xs text-[var(--netflix-muted)]">
            <span>{formatTime(progress)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setVolume(vol);
                setIsMuted(vol === 0);
              }}
              className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          {/* Expand/Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}