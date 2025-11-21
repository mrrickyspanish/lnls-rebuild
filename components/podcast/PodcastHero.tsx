"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import Image from 'next/image';
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
  hosts?: string;
  topics?: string[];
};

type PodcastHeroProps = {
  currentEpisode: Episode;
};

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PodcastHero({ currentEpisode }: PodcastHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset player when episode changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [currentEpisode.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="mb-12">
      {/* Audio Element */}
      <audio ref={audioRef} src={currentEpisode.audio_url} preload="metadata" />

      {/* Player Container */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl p-8 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Episode Artwork */}
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative w-full lg:w-[300px] aspect-square rounded-lg overflow-hidden shadow-2xl ring-2 ring-white/20"
            >
              {currentEpisode.image_url ? (
                <Image
                  src={currentEpisode.image_url}
                  alt={currentEpisode.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-yellow-900 flex items-center justify-center">
                  <span className="text-white/20 text-6xl font-bold">LNLS</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Player Controls & Info */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Episode Info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                {currentEpisode.episode_number && (
                  <>
                    <span className="font-semibold text-[var(--netflix-red)]">
                      Episode {currentEpisode.episode_number}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>{formatDate(currentEpisode.published_at)}</span>
                <span>•</span>
                <span>{formatDuration(currentEpisode.duration)}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-netflix">
                {currentEpisode.title}
              </h1>

              {currentEpisode.hosts && (
                <p className="text-white/70 mb-3">
                  Hosted by {currentEpisode.hosts}
                </p>
              )}

              <p className="text-white/80 leading-relaxed line-clamp-3">
                {currentEpisode.description}
              </p>

              {/* Topics */}
              {currentEpisode.topics && currentEpisode.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentEpisode.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Player Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:transition-transform"
                  style={{
                    background: `linear-gradient(to right, var(--netflix-red) 0%, var(--netflix-red) ${progress}%, rgba(255,255,255,0.2) ${progress}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-white/60">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                {/* Skip Back */}
                <button
                  onClick={() => skip(-15)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Skip back 15 seconds"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-black fill-current" />
                  ) : (
                    <Play className="w-7 h-7 text-black fill-current ml-1" />
                  )}
                </button>

                {/* Skip Forward */}
                <button
                  onClick={() => skip(15)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Skip forward 15 seconds"
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}