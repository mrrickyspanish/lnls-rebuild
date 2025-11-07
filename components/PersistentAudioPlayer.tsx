"use client";

import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import { Play, Pause, Volume2, VolumeX, X, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function PersistentAudioPlayer() {
  const {
    currentEpisode,
    isPlaying,
    progress,
    duration,
    volume,
    isMinimized,
    pause,
    resume,
    seek,
    setVolume,
    toggleMinimize,
    close,
  } = useAudioPlayer();

  const progressRef = useRef<HTMLDivElement>(null);

  // Don't render if no episode loaded
  if (!currentEpisode) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
        border-t border-slate-700/50
        shadow-2xl
        transition-all duration-300
        ${isMinimized ? "h-16" : "h-24 md:h-28"}
      `}
      role="region"
      aria-label="Audio player"
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-full flex items-center gap-4">
        {/* Episode Art */}
        <div className={`relative flex-shrink-0 ${isMinimized ? "w-12 h-12" : "w-16 h-16 md:w-20 md:h-20"} rounded-lg overflow-hidden bg-slate-700`}>
          {currentEpisode.image_url ? (
            <Image
              src={currentEpisode.image_url}
              alt={currentEpisode.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
          )}
        </div>

        {/* Episode Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0 flex-grow">
              {!isMinimized && currentEpisode.episode_number && (
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">
                  Episode {currentEpisode.episode_number}
                </p>
              )}
              <h3 className={`font-semibold text-white truncate ${isMinimized ? "text-sm" : "text-base md:text-lg"}`}>
                {currentEpisode.title}
              </h3>
            </div>

            {/* Controls (right side) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Play/Pause */}
              <button
                onClick={isPlaying ? pause : resume}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6 text-white fill-current" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-current ml-0.5" />
                )}
              </button>

              {/* Volume (desktop only) */}
              {!isMinimized && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                    className="text-slate-400 hover:text-white transition-colors"
                    aria-label={volume > 0 ? "Mute" : "Unmute"}
                  >
                    {volume > 0 ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-indigo-500"
                    aria-label="Volume"
                  />
                </div>
              )}

              {/* Minimize/Expand */}
              <button
                onClick={toggleMinimize}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label={isMinimized ? "Expand player" : "Minimize player"}
              >
                {isMinimized ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {/* Close */}
              <button
                onClick={close}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {!isMinimized && (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs text-slate-400 tabular-nums min-w-[40px]">
                {formatTime(progress)}
              </span>
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                className="flex-grow h-2 bg-slate-700 rounded-full cursor-pointer group relative"
                role="slider"
                aria-label="Seek"
                aria-valuenow={Math.floor(progress)}
                aria-valuemin={0}
                aria-valuemax={Math.floor(duration)}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progressPercentage}% - 6px)` }}
                />
              </div>
              <span className="text-xs text-slate-400 tabular-nums min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}