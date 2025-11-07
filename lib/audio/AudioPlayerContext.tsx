"use client";

import React, { createContext, useContext, useRef, useState, useEffect } from "react";

type Episode = {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string;
  episode_number?: number;
};

type AudioPlayerState = {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  progress: number; // seconds
  duration: number; // seconds
  volume: number; // 0-1
  isMinimized: boolean;
};

type AudioPlayerActions = {
  playEpisode: (episode: Episode) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMinimize: () => void;
  close: () => void;
};

type AudioPlayerContextType = AudioPlayerState & AudioPlayerActions;

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [state, setState] = useState<AudioPlayerState>({
    currentEpisode: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
    isMinimized: false,
  });

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;

    const audio = audioRef.current;

    // Event listeners
    const handleTimeUpdate = () => {
      setState((prev) => ({ ...prev, progress: audio.currentTime }));
    };

    const handleDurationChange = () => {
      setState((prev) => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
    };

    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, []);

  const playEpisode = (episode: Episode) => {
    if (!audioRef.current) return;

    // If same episode, just resume
    if (state.currentEpisode?.id === episode.id) {
      audioRef.current.play();
      return;
    }

    // New episode
    audioRef.current.src = episode.audio_url;
    audioRef.current.load();
    audioRef.current.play();

    setState((prev) => ({
      ...prev,
      currentEpisode: episode,
      isPlaying: true,
      progress: 0,
      isMinimized: false,
    }));
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const resume = () => {
    audioRef.current?.play();
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState((prev) => ({ ...prev, progress: time }));
    }
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState((prev) => ({ ...prev, volume: clampedVolume }));
  };

  const toggleMinimize = () => {
    setState((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const close = () => {
    audioRef.current?.pause();
    setState({
      currentEpisode: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      volume: state.volume,
      isMinimized: false,
    });
  };

  const value: AudioPlayerContextType = {
    ...state,
    playEpisode,
    pause,
    resume,
    seek,
    setVolume,
    toggleMinimize,
    close,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}