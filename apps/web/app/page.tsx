import { Suspense } from "react";
import { ArticleCard, PodcastCard, VideoCard, SkeletonBlock, SkeletonList, SubscribeForm } from "@lnls/ui";
import { fetchHomeContent } from "../src/lib/sanity/fetchers";
import { supabaseClient } from "../src/lib/supabase/client";
import { fetchAiNewsStream } from "../src/lib/supabase/queries";

const Hero = async () => {
  const [{ featuredArticle, latestVideos }, aiNews] = await Promise.all([
    fetchHomeContent(),
    fetchAiNewsStream(supabaseClient())
  ]);

  const latestVideo = latestVideos[0];

  return (
    <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
      <div className="space-y-4 rounded-3xl border border-slateBase/60 bg-charcoal/90 p-8">
        <p className="text-sm uppercase tracking-wide text-neonPurple">Featured</p>
        {latestVideo ? (
          <div className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-2xl border border-slateBase/60">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${latestVideo.youtubeId}`}
                title={latestVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h1 className="font-headline text-5xl text-offWhite md:text-6xl">{latestVideo.title}</h1>
            <p className="text-sm uppercase tracking-wide text-metaGray">
              {latestVideo.publishedAt ? new Date(latestVideo.publishedAt).toLocaleString() : "Fresh from YouTube"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <SkeletonBlock className="h-64 w-full" />
            <SkeletonBlock className="h-10 w-2/3" />
          </div>
        )}
        {featuredArticle ? (
          <div className="rounded-full border border-neonPurple/50 bg-neonPurple/10 px-4 py-2 text-sm text-neonPurple">
            {featuredArticle.title}
          </div>
        ) : null}
      </div>
      <aside className="flex flex-col gap-4 rounded-3xl border border-slateBase/60 bg-charcoal/90 p-6">
        <h2 className="font-headline text-2xl text-offWhite">AI News Stream</h2>
        <p className="text-sm text-offWhite/70">
          Rapid Lakers + NBA updates generated with Claude, sourced from trusted feeds.
        </p>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {aiNews.length === 0 ? (
            <SkeletonList count={4} />
          ) : (
            aiNews.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slateBase/40 bg-slateBase/40 p-4">
                <p className="text-xs uppercase tracking-wide text-metaGray">
                  {new Date(item.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <h3 className="font-semibold text-offWhite">{item.headline}</h3>
                <p className="text-sm text-offWhite/70">{item.summary}</p>
              </article>
            ))
          )}
        </div>
      </aside>
    </section>
  );
};

export default async function HomePage() {
  const { latestEpisodes, latestVideos, featuredArticle } = await fetchHomeContent();
  const aiNewsPromise = fetchAiNewsStream(supabaseClient());

  return (
    <div className="flex flex-col gap-16">
      <Suspense fallback={<SkeletonBlock className="h-[480px] w-full" />}>
        {/* @ts-expect-error Async Server Component */}
        <Hero />
      </Suspense>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <h2 className="font-headline text-4xl text-offWhite">Trending Articles</h2>
          {featuredArticle ? (
            <ArticleCard slug={featuredArticle.slug} title={featuredArticle.title} dek={featuredArticle.dek} publishAt={featuredArticle.publishAt} />
          ) : (
            <SkeletonBlock className="h-40 w-full" />
          )}
        </div>
        <SubscribeForm />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-4xl text-offWhite">Latest Episodes</h2>
          <a href="/podcast" className="text-sm uppercase text-neonPurple hover:text-neonGold">
            View All
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {latestEpisodes.length ? (
            latestEpisodes.map((episode) => (
              <PodcastCard
                key={episode.id}
                slug={episode.slug}
                title={episode.title}
                audioUrl={episode.audioUrl}
                duration={episode.duration}
                publishedAt={episode.publishedAt}
                showNotes={episode.showNotes ?? undefined}
              />
            ))
          ) : (
            <SkeletonList count={3} />
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-4xl text-offWhite">Latest Videos</h2>
          <a href="/videos" className="text-sm uppercase text-neonPurple hover:text-neonGold">
            Watch More
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {latestVideos.length ? (
            latestVideos.map((video) => (
              <VideoCard
                key={video.id}
                youtubeId={video.youtubeId}
                title={video.title}
                publishedAt={video.publishedAt}
                isShort={video.playlist?.toLowerCase().includes("shorts") ?? false}
              />
            ))
          ) : (
            <SkeletonList count={3} />
          )}
        </div>
      </section>

      <Suspense fallback={<SkeletonList count={6} />}>
        {/* @ts-expect-error Async Server Component */}
        <AiNewsStream promise={aiNewsPromise} />
      </Suspense>
    </div>
  );
}

const AiNewsStream = async ({ promise }: { promise: ReturnType<typeof fetchAiNewsStream> }) => {
  const items = await promise;
  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="font-headline text-4xl text-offWhite">AI News Stream</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slateBase/40 bg-charcoal/80 p-6">
            <div className="flex items-center justify-between text-xs uppercase text-metaGray">
              <span>{item.source}</span>
              <time>{new Date(item.published_at).toLocaleString()}</time>
            </div>
            <h3 className="mt-3 font-semibold text-offWhite">{item.headline}</h3>
            <p className="text-sm text-offWhite/80">{item.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.topics?.map((topic) => (
                <span key={topic} className="rounded-full bg-neonPurple/20 px-3 py-1 text-xs text-neonPurple">
                  {topic}
                </span>
              ))}
            </div>
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm uppercase text-neonGold hover:text-offWhite"
            >
              Read source
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
