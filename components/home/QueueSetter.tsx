"use client";

import { useEffect } from "react";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";

type Episode = {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string;
  episode_number?: number;
};

export default function QueueSetter({ episodes }: { episodes: Episode[] }) {
  const { setQueue } = useAudioPlayer();
  
  useEffect(() => {
    if (episodes.length > 0) {
      setQueue(episodes);
    }
  }, [episodes, setQueue]);
  
  return null;
}