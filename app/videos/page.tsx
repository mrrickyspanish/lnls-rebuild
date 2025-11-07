"use client";

import { useEffect, useState } from "react";
import { getNewsStream } from "@/lib/supabase/client";
import Image from "next/image";
import { Play } from "lucide-react";
import VideoModal from "@/components/VideoModal";

type Video = {
  id: string;
  title: string;
  source_url: string;
  image_url?: string;
  published_at?: string;
  source?: string;
};

type FilterType = "all" | "news" | "recaps" | "analysis";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      const allContent = await getNewsStream(50);
      const videoContent = allContent.filter((item: any) => {
        const ct = (item.content_type || "").toLowerCase();
        const url = item.source_url || "";
        return ct === "video" || url.includes("youtube.com") || url.includes("youtu.be");
      });
      setVideos(videoContent);
      setLoading(false);
    }
    loadVideos();
  }, []);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/);
    return match ? match[1] : null;
  };

  const detectCategory = (video: Video): FilterType => {
    const title = video.title.toLowerCase();
    if (title.includes("recap") || title.includes("highlights")) return "recaps";
    if (title.includes("analysis") || title.includes("breakdown")) return "analysis";
    return "news";
  };

  const filtered = filter === "all" 
    ? videos.slice(0, 12) 
    : videos.filter(v => detectCategory(v) === filter).slice(0, 12);

  const featured = videos[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading videos...</div>
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-300 to-cyan-200 mb-4">
            Videos
          </h1>
          <p className="text-slate-400">No videos available yet.</p>
        </div>
      </div>
    );
  }

  const featuredId = getYouTubeId(featured.source_url);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 md:py-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-300 to-cyan-200 mb-4">
            Videos
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Watch the latest Lakers analysis, highlights, and discussions.
          </p>
        </div>

        <div className="mb-12 bg-slate-900/40 backdrop-blur-sm rounded-3xl p-4 md:p-6 shadow-2xl">
          <div 
            className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl cursor-pointer group"
            onClick={() => {
              setSelectedVideo({ url: featured.source_url, title: featured.title });
              setModalOpen(true);
            }}
          >
            {featuredId ? (
              <Image
                src={`https://img.youtube.com/vi/${featuredId}/maxresdefault.jpg`}
                alt={featured.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50" />
            )}
            
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-current ml-2" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {featured.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              {featured.published_at && (
                <span>{new Date(featured.published_at).toLocaleDateString()}</span>
              )}
              {featured.source && (
                <>
                  <span>•</span>
                  <span>{featured.source}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 rounded-full bg-slate-900/60 backdrop-blur-sm p-1 w-fit">
          {(["all", "news", "recaps", "analysis"] as FilterType[]).map((f) => {
            const active = f === filter;
            const labels = { all: "All", news: "Lakers News", recaps: "Game Recaps", analysis: "Analysis" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                ].join(" ")}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((video) => {
            const videoId = getYouTubeId(video.source_url);
            const thumbnailUrl = videoId
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : video.image_url;

            return (
              <div
                key={video.id}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedVideo({ url: video.source_url, title: video.title });
                  setModalOpen(true);
                }}
              >
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20">
                  <div className="relative aspect-video overflow-hidden">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/0 group-hover:bg-red-600 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all">
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {video.title}
                    </h3>
                    {video.published_at && (
                      <p className="text-xs text-slate-500">
                        {new Date(video.published_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && selectedVideo && (
        <VideoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
}
