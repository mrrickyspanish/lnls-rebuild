'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import VideoModal from './VideoModal';

interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  pubDate?: string;
  link?: string;
}

interface VideoGridProps {
  videos: Video[];
}

function formatDate(date?: string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function extractVideoId(url: string): string {
  const [, query = ''] = url.split('?');
  const urlParams = new URLSearchParams(query);
  const videoId = urlParams.get('v');
  if (videoId) return videoId;

  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];

  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?]+)/);
  if (shortsMatch) return shortsMatch[1];

  return url;
}

function isShort(url: string): boolean {
  return url.includes('/shorts/');
}

export default function VideoGrid({ videos }: VideoGridProps) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const handleVideoClick = (video: Video) => {
    const videoUrl = video.link || `https://www.youtube.com/watch?v=${video.id}`;

    if (isShort(videoUrl)) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    setSelectedVideoId(videoId);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video, index) => {
          const videoUrl = video.link || `https://www.youtube.com/watch?v=${video.id}`;
          const isVideoShort = isShort(videoUrl);

          return (
            <button
              key={video.id}
              onClick={() => handleVideoClick(video)}
              className={`group relative overflow-hidden rounded-2xl bg-surface/95 backdrop-blur-sm border border-white/10 transition-all hover:border-secondary/50 hover:shadow-[var(--glow-blue)] text-left ${index === 0 ? 'lg:row-span-2' : ''}`}
            >
              {isVideoShort && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-lg">
                  Short
                </div>
              )}
            <div className={`relative aspect-video ${index === 0 ? 'lg:aspect-[16/9]' : ''}`}>
              {video.thumbnail ? (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                  {isVideoShort ? (
                    <ExternalLink className="w-7 h-7 text-black" />
                  ) : (
                    <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg md:text-xl font-display font-bold text-white group-hover:text-secondary transition line-clamp-2">
                {video.title}
              </h3>
              <time className="text-sm text-tertiary mt-2 block">
                {formatDate(video.pubDate)}
              </time>
            </div>
            </button>
          );
        })}
      </div>

      <VideoModal
        videoId={selectedVideoId}
        onClose={() => setSelectedVideoId(null)}
      />
    </>
  );
}
