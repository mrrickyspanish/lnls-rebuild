"use client";

import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Minimize2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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
    hasPrev,
    closePlayer
  } = useAudioPlayer();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'arrowleft':
      case 'j':
        e.preventDefault();
        seek(Math.max(0, progress - 10));
        break;
      case 'arrowright':
      case 'l':
        e.preventDefault();
        seek(Math.min(duration, progress + 10));
        break;
      case 'arrowup':
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.1));
        setIsMuted(false);
        break;
      case 'arrowdown':
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.1));
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'n':
        e.preventDefault();
        if (hasNext) nextEpisode();
        break;
      case 'p':
        e.preventDefault();
        if (hasPrev) prevEpisode();
        break;
      case 'f':
        e.preventDefault();
        setIsExpanded(!isExpanded);
        break;
      case 'escape':
        e.preventDefault();
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          closePlayer();
        }
        break;
    }
  }, [togglePlay, seek, progress, duration, setVolume, volume, hasNext, hasPrev, nextEpisode, prevEpisode, isExpanded, closePlayer]);

  // Add keyboard event listener
  useEffect(() => {
    if (currentEpisode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentEpisode, handleKeyDown]);

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
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0, height: isExpanded ? "auto" : "auto" }}
        exit={{ y: 100 }}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-white/10 transition-all duration-300 ${
          isExpanded ? "h-[80vh] md:h-[400px]" : ""
        }`}
      >
        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-8 flex flex-col md:flex-row gap-8 items-center justify-center h-[calc(100%-80px)]">
            {currentEpisode.image_url && (
              <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={currentEpisode.image_url}
                  alt={currentEpisode.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-center md:text-left max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {currentEpisode.title}
              </h2>
              <p className="text-lg text-[var(--netflix-muted)] mb-6">
                {currentEpisode.episode_number && `Episode ${currentEpisode.episode_number}`}
              </p>
              <div className="text-sm text-white/60 leading-relaxed line-clamp-4 mb-6">
                {/* Description would go here if available in Episode type */}
              </div>
              {/* Keyboard Shortcuts Help */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-xs font-semibold text-white/80 mb-3 uppercase tracking-wide">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">Space</kbd> Play/Pause</div>
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">←/→</kbd> Skip ±10s</div>
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">↑/↓</kbd> Volume</div>
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">M</kbd> Mute</div>
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">N</kbd> Next</div>
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">P</kbd> Previous</div>
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">F</kbd> Fullscreen</div>
                  <div><kbd className="px-2 py-1 bg-white/10 rounded text-white/80">Esc</kbd> Close</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div 
          role="progressbar" 
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={progress}
          tabIndex={0}
          className="relative h-1 bg-white/20 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50" 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            seek(percent * duration);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              seek(Math.max(0, progress - 10));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              seek(Math.min(duration, progress + 10));
            }
          }}
        >
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
              aria-label="Previous episode (P)"
              title="Previous episode (P)"
              className={`transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded ${
                hasPrev 
                  ? 'text-white/70 hover:text-white' 
                  : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause (Space)" : "Play (Space)"}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#181818]"
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
              aria-label="Next episode (N)"
              title="Next episode (N)"
              className={`transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded ${
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
            <button 
              onClick={toggleMute} 
              aria-label={isMuted || volume === 0 ? "Unmute (M)" : "Mute (M)"}
              title={isMuted || volume === 0 ? "Unmute (M)" : "Mute (M)"}
              className="text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
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
              aria-label="Volume control (Arrow Up/Down)"
              title="Volume control (Arrow Up/Down)"
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
            aria-label={isExpanded ? "Minimize player (F)" : "Expand player (F)"}
            title={isExpanded ? "Minimize player (F)" : "Expand player (F)"}
            className="text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={closePlayer}
            aria-label="Close player (Escape)"
            title="Close player (Escape)"
            className="text-white/70 hover:text-white transition-colors ml-2 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}