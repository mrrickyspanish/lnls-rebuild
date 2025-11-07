import type { Metadata } from "next";
import { getNewsStream } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Play, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Videos",
  description: "Watch Late Night Lake Show videos and highlights.",
};

export const revalidate = 60;

async function getVideos() {
  const allContent = await getNewsStream(100);
  // Filter for videos only
  const videos = allContent.filter((item: any) => {
    const ct = (item.content_type || "").toLowerCase();
    const url = item.source_url || "";
    return ct === "video" || url.includes("youtube.com") || url.includes("youtu.be");
  });
  return videos;
}

export default async function VideosPage() {
  const videos = await getVideos();
  const featuredVideo = videos[0];
  const restVideos = videos.slice(1);

  if (!featuredVideo) {
    return (
      <div className="section-container py-12">
        <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-4">Videos</h1>
        <p className="text-slate-muted">No videos available yet.</p>
      </div>
    );
  }

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/);
    return match ? match[1] : null;
  };

  const featuredId = getYouTubeId(featuredVideo.source_url || "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="section-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-4">
            Videos
          </h1>
          <p className="text-lg text-slate-muted max-w-2xl">
            Watch the latest Lakers analysis, highlights, and discussions.
          </p>
        </div>

        {/* Featured Video Player */}
        <div className="mb-12">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
            {featuredId ? (
              <iframe
                src={`https://www.youtube.com/embed/${featuredId}?autoplay=1&rel=0`}
                title={featuredVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                Video unavailable
              </div>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-2xl md:text-3xl font-bebas text-offwhite mb-2">
              {featuredVideo.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-muted">
              {featuredVideo.published_at && (
                <span>
                  {formatDistanceToNow(new Date(featuredVideo.published_at), { addSuffix: true })}
                </span>
              )}
              {featuredVideo.source && (
                <>
                  <span>•</span>
                  <span>{featuredVideo.source}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* More Videos Grid */}
        {restVideos.length > 0 && (
          <>
            <h3 className="text-2xl font-bebas text-offwhite mb-6">More Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restVideos.map((video: any) => {
                const videoId = getYouTubeId(video.source_url || "");
                const thumbnailUrl = videoId 
                  ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  : video.image_url;

                return (
                  <Link
                    key={video.id}
                    href={video.source_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <article className="card h-full flex flex-col bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 hover:border-indigo-500/50 transition-all">
                      {/* Thumbnail */}
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                        {thumbnailUrl ? (
                          <Image
                            src={thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20" />
                        )}

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-slate-base/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                            <Play className="w-7 h-7 text-white fill-current ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-bebas text-offwhite mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2 px-3">
                        {video.title}
                      </h4>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-slate-muted mt-auto pt-3 px-3 pb-3 border-t border-slate-muted/20">
                        {video.published_at && (
                          <span>
                            {formatDistanceToNow(new Date(video.published_at), { addSuffix: true })}
                          </span>
                        )}
                        {video.source && (
                          <>
                            <span>•</span>
                            <span>{video.source}</span>
                          </>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}