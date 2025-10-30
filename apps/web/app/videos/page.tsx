import type { Metadata } from "next";
import { VideoCard, SkeletonList } from "@lnls/ui";
import { buildMetadata } from "../../src/utils/metadata";
import { fetchVideoGrid } from "../../src/lib/sanity/fetchers";

export const metadata: Metadata = buildMetadata({
  title: "Videos | Late Night Lake Show",
  description: "Watch the latest LNLS livestreams, breakdowns, and shorts."
});

export default async function VideosPage() {
  const videos = await fetchVideoGrid();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-headline text-5xl text-offWhite">Videos</h1>
        <p className="text-offWhite/70">Fresh uploads from our YouTube and Shorts feeds.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {videos.length ? (
          videos.map((video) => (
            <VideoCard
              key={video.id}
              youtubeId={video.youtubeId}
              title={video.title}
              publishedAt={video.publishedAt}
              isShort={video.playlist?.toLowerCase().includes("short") ?? false}
            />
          ))
        ) : (
          <SkeletonList count={6} />
        )}
      </div>
    </div>
  );
}
