import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PodcastCard } from "@lnls/ui";
import { buildMetadata } from "../../../src/utils/metadata";
import { podcastJsonLd } from "../../../src/utils/jsonld";
import { fetchPodcastEpisodeBySlug } from "../../../src/lib/sanity/fetchers";

export const generateMetadata = async ({ params }: { params: { slug: string } }): Promise<Metadata> => {
  const episode = await fetchPodcastEpisodeBySlug(params.slug);
  if (!episode) {
    return buildMetadata({
      title: "Podcast Episode | Late Night Lake Show",
      description: "Catch the latest episode of the Late Night Lake Show."
    });
  }

  return buildMetadata({
    title: `${episode.title} | Late Night Lake Show`,
    description: episode.duration ? `${episode.duration} | LNLS Podcast` : episode.title
  });
};

export default async function PodcastEpisodePage({ params }: { params: { slug: string } }) {
  const episode = await fetchPodcastEpisodeBySlug(params.slug);
  if (!episode) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify(
        podcastJsonLd({ title: episode.title, slug: episode.slug, publishAt: episode.publishedAt ?? undefined })
      )}</script>
      <PodcastCard
        slug={episode.slug}
        title={episode.title}
        audioUrl={episode.audioUrl}
        duration={episode.duration}
        publishedAt={episode.publishedAt}
      />
      <div className="rounded-2xl border border-slateBase/40 bg-charcoal/80 p-6 text-offWhite/70">
        <p>Show notes: {episode.guests?.join(", ") ?? "Coming soon"}</p>
      </div>
    </div>
  );
}
