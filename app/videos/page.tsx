import { Metadata } from 'next';
import { Play } from 'lucide-react';
import { getYouTubeRSS } from '@/lib/youtube-rss';
import VideoGrid from '@/components/video/VideoGrid';

export const metadata: Metadata = {
  title: 'Videos | Late Night Lake Show',
  description: 'Watch the latest Lakers and NBA content from LNLS - full episodes, highlights, and analysis.',
};

export const revalidate = 60;

export default async function VideosPage() {
  const videos = (await getYouTubeRSS()).slice(0, 12);
  const hasVideos = videos.length > 0;

  return (
    <>
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pb-48">
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24 md:pt-32">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
              Videos
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-[var(--text-secondary)] max-w-xl">
              The best moments. No filler.
            </p>
          </div>
        </div>

        <div className="relative z-20 pt-56 md:pt-64 px-6 pb-32">
          <div className="max-w-7xl mx-auto">
            {hasVideos ? (
              <VideoGrid videos={videos} />
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-surface">
                <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
                <p className="text-[var(--text-secondary)]">
                  Check back later for new content.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}