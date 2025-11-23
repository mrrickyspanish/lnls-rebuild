"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";

type Episode = {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string;
  episode_number?: number;
};

type AudioContextType = {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  queue: Episode[];
  playEpisode: (episode: Episode, queue?: Episode[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  nextEpisode: () => void;
  prevEpisode: () => void;
  setQueue: (episodes: Episode[]) => void;
  hasNext: boolean;
  hasPrev: boolean;
  closePlayer: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [episodeQueue, setEpisodeQueue] = useState<Episode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasNext = currentIndex >= 0 && currentIndex < episodeQueue.length - 1;
  const hasPrev = currentIndex > 0;

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next episode after a short delay
      setTimeout(() => {
        const currentIdx = episodeQueue.findIndex(ep => ep?.id === currentEpisode?.id);
        const hasNextEp = currentIdx >= 0 && currentIdx < episodeQueue.length - 1;
        if (hasNextEp && episodeQueue[currentIdx + 1]) {
          const nextEp = episodeQueue[currentIdx + 1];
          if (audioRef.current) {
            audioRef.current.src = nextEp.audio_url;
            audioRef.current.load();
            audioRef.current.play();
            setCurrentEpisode(nextEp);
            setCurrentIndex(currentIdx + 1);
            setIsPlaying(true);
          }
        }
      }, 1000);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  const playEpisode = (episode: Episode, queue?: Episode[]) => {
    if (!audioRef.current) return;

    // If a queue is provided, update it and find the episode index
    if (queue) {
      setEpisodeQueue(queue);
      const index = queue.findIndex(ep => ep.id === episode.id);
      setCurrentIndex(index);
    } else {
      // If no queue provided, check if episode is in current queue
      const index = episodeQueue.findIndex(ep => ep.id === episode.id);
      if (index >= 0) {
        setCurrentIndex(index);
      } else {
        // Add to queue if not found
        setEpisodeQueue(prev => [...prev, episode]);
        setCurrentIndex(episodeQueue.length);
      }
    }

    if (currentEpisode?.id === episode.id) {
      togglePlay();
      return;
    }

    audioRef.current.src = episode.audio_url;
    audioRef.current.load();
    audioRef.current.play();
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentEpisode) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolumeState(vol);
    }
  };

  const nextEpisode = () => {
    if (hasNext && episodeQueue[currentIndex + 1]) {
      const nextEp = episodeQueue[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setCurrentEpisode(nextEp);
      
      if (audioRef.current) {
        audioRef.current.src = nextEp.audio_url;
        audioRef.current.load();
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const prevEpisode = () => {
    if (hasPrev && episodeQueue[currentIndex - 1]) {
      const prevEp = episodeQueue[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setCurrentEpisode(prevEp);
      
      if (audioRef.current) {
        audioRef.current.src = prevEp.audio_url;
        audioRef.current.load();
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentEpisode(null);
  };

  return (
    <AudioContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        progress,
        duration,
        volume,
        playEpisode,
        togglePlay,
        seek,
        setVolume,
        nextEpisode,
        prevEpisode,
        setQueue: setEpisodeQueue,
        queue: episodeQueue,
        hasNext,
        hasPrev,
        closePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}