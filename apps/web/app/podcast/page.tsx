import type { Metadata } from "next";
import { PodcastCard, SkeletonList } from "@lnls/ui";
import { buildMetadata } from "../../src/utils/metadata";
import { fetchPodcastEpisodes } from "../../src/lib/sanity/fetchers";

export const metadata: Metadata = buildMetadata({
  title: "Podcast | Late Night Lake Show",
  description: "Listen to the latest Late Night Lake Show episodes, interviews, and post-game breakdowns."
});

export default async function PodcastPage() {
  const episodes = await fetchPodcastEpisodes();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-headline text-5xl text-offWhite">Podcast</h1>
        <p className="text-offWhite/70">Tap play or jump into the archive for more episodes.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {episodes.length ? (
          episodes.map((episode) => (
            <PodcastCard
              key={episode.id}
              slug={episode.slug}
              title={episode.title}
              audioUrl={episode.audioUrl}
              duration={episode.duration}
              publishedAt={episode.publishedAt}
            />
          ))
        ) : (
          <SkeletonList count={4} />
        )}
      </div>
    </div>
  );
}
