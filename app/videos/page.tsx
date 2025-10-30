import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos | Late Night Lake Show',
  description: 'Watch the latest Lakers and NBA content from LNLS - full episodes, highlights, and analysis.',
  openGraph: {
    title: 'LNLS Videos - Lakers & NBA Content',
    description: 'Watch the latest Lakers and NBA content from LNLS',
    type: 'website',
  },
};

// This will be populated from YouTube API
async function getYouTubeVideos() {
  // TODO: Implement when YOUTUBE_API_KEY is available
  // For now, return empty array - page structure is ready
  return {
    fullEpisodes: [],
    shorts: [],
    recentUploads: [],
  };
}

export default async function VideosPage() {
  const videos = await getYouTubeVideos();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              LNLS <span className="text-purple-400">Videos</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Full episodes, game breakdowns, player analysis, and everything Lakers — all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Upload - Featured */}
      {videos.recentUploads.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Latest Upload</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-amber-400"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden group">
                <iframe
                  src={`https://www.youtube.com/embed/${videos.recentUploads[0].id}`}
                  title={videos.recentUploads[0].title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {videos.recentUploads[0].title}
              </h3>
              <p className="text-slate-400">
                {videos.recentUploads[0].description}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{videos.recentUploads[0].views} views</span>
                <span>•</span>
                <span>{videos.recentUploads[0].publishedAt}</span>
              </div>
              <a
                href={`https://youtube.com/watch?v=${videos.recentUploads[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Full Episodes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Full Episodes</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-amber-400"></div>
        </div>

        {videos.fullEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.fullEpisodes.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <EmptyState type="episodes" />
        )}
      </section>

      {/* Shorts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Shorts & Highlights</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-amber-400"></div>
        </div>

        {videos.shorts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {videos.shorts.map((video: any) => (
              <ShortCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <EmptyState type="shorts" />
        )}
      </section>

      {/* Subscribe CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-amber-900/30 border border-purple-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Never Miss an Upload
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Subscribe on YouTube for daily Lakers coverage, postgame reactions, and in-depth analysis.
          </p>
          <a
            href="https://youtube.com/@latenightlakeshow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Subscribe to LNLS
          </a>
        </div>
      </section>
    </div>
  );
}

function VideoCard({ video }: { video: any }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      <h3 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">
        {video.title}
      </h3>
      <p className="text-slate-400 text-sm">
        {video.views} views • {video.publishedAt}
      </p>
    </div>
  );
}

function ShortCard({ video }: { video: any }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[9/16] bg-slate-900 rounded-lg overflow-hidden mb-2">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-90">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 9.35L15 12l-5 2.65z"/>
              <path fillRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd"/>
            </svg>
            Short
          </div>
        </div>
      </div>
      <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-400 transition-colors">
        {video.title}
      </p>
    </div>
  );
}

function EmptyState({ type }: { type: 'episodes' | 'shorts' }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {type === 'episodes' ? 'No episodes yet' : 'No shorts yet'}
      </h3>
      <p className="text-slate-400 mb-6">
        {type === 'episodes' 
          ? 'Full episodes will appear here once the YouTube API is connected.'
          : 'Shorts and highlights will appear here once the YouTube API is connected.'
        }
      </p>
    </div>
  );
}
