import ContentRowWithHero from "@/components/home/ContentRowWithHero";
import ContentRow from "@/components/home/ContentRow";
import ComingSoonRow from "@/components/home/ComingSoonRow";
import QueueSetter from "@/components/home/QueueSetter";
import { getPublishedArticles } from "@/lib/articles";
import { getNewsStream } from "@/lib/supabase/client";
import { getYouTubeRSS } from "@/lib/youtube-rss";
import type { Article } from "@/types/supabase";
import { filterOwnedContent, filterExternalContent, isOwnedContent } from "@/lib/content";

export const revalidate = 60;

export default async function HomePage() {
  try {
    const [supabaseData, lakersArticlesRaw, nbaArticlesRaw, youtubeVideos] = await Promise.all([
      getNewsStream(50),
      getPublishedArticles(12, "Lakers"),
      getPublishedArticles(12, "NBA"),
      getYouTubeRSS(),
    ]);
    const podcastResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/podcast/episodes`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? data : [])
      .catch(() => []);

    // Process Supabase data
    const supabaseItems = (supabaseData || []).map((item: any) => ({
      id: String(item.id),
      title: item.title,
      excerpt: item.excerpt || undefined,
      description: item.excerpt || undefined,
      image_url: item.image_url || null,
      content_type: item.content_type || "article",
      source: item.source || undefined,
      source_url: item.source_url || null,
      published_at: item.published_at || null,
    }));

    const mapArticleToContentItem = (article: Article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || undefined,
      description: article.excerpt || undefined,
      image_url: article.hero_image_url || null,
      content_type: "article" as const,
      source: "TDD",
      source_url: `/news/${article.slug}`,
      published_at: article.published_at || article.created_at,
    });

    const toTimestamp = (value?: string | null) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const sortByDateDesc = <T extends { published_at?: string | null }>(items: T[]) =>
      [...items].sort((a, b) => toTimestamp(b.published_at) - toTimestamp(a.published_at));

    const dedupeById = <T extends { id?: string | number }>(items: T[]) => {
      const seen = new Set<string>();
      return items.filter((item) => {
        if (item?.id === undefined || item?.id === null) return false;
        const key = String(item.id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    type ContentItem = (typeof supabaseItems)[number];

    // Convert podcast episodes from API to proper format
    const podcastContent = (podcastResponse || []).map((episode: any) => ({
      id: episode.id,
      title: episode.title,
      excerpt: episode.description || undefined,
      description: episode.description,
      image_url: episode.image_url,
      content_type: "podcast" as const,
      source: "TDD Podcast",
      source_url: episode.audio_url, // Use audio URL as the link
      published_at: episode.published_at,
      duration: episode.duration,
      episode_number: episode.episode_number,
      audio_url: episode.audio_url, // Add for audio player
    }));

    const latestPodcastEpisode = podcastContent.length
      ? [...podcastContent].sort((a, b) => toTimestamp(b.published_at) - toTimestamp(a.published_at))[0]
      : null;

    // Process YouTube Videos
    const videoContent = (youtubeVideos || []).map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description || undefined,
      image_url: video.thumbnail,
      content_type: "video" as const,
      source: "TDD YouTube",
      source_url: video.link,
      published_at: video.pubDate,
      duration: undefined, // RSS doesn't provide duration
    }));

    const nbaArticles = (nbaArticlesRaw || []).map(mapArticleToContentItem);
    const lakersArticles = (lakersArticlesRaw || []).map(mapArticleToContentItem);
    
    const allArticles = [...lakersArticles, ...nbaArticles];

    const latestArticle = allArticles.length
      ? [...allArticles].sort((a, b) => toTimestamp(b.published_at) - toTimestamp(a.published_at))[0]
      : null;

    // Merge all content
    const allContent = [...supabaseItems, ...podcastContent, ...allArticles, ...videoContent];

    const ownedContent = filterOwnedContent(allContent);
    const externalContent = filterExternalContent(allContent);

    // Trending Now - Owned Content Only
    const trendingNow = dedupeById(sortByDateDesc(ownedContent)).slice(0, 10);

    // Around the League - External Content Only
    const aroundLeagueItems = dedupeById(sortByDateDesc(externalContent)).slice(0, 10);

    const HERO_ITEM_TARGET = 4;

    // Hero Logic: 1 Latest Article + 1 Latest Podcast + Fill with Owned
    let heroItems: ContentItem[] = [];
    
    if (latestArticle) heroItems.push(latestArticle);
    if (latestPodcastEpisode) heroItems.push(latestPodcastEpisode);

    const usedIds = new Set(heroItems.map(i => i.id));
    
    const fillerItems = dedupeById(sortByDateDesc(ownedContent))
      .filter(item => !usedIds.has(item.id) && item.image_url);

    heroItems = [...heroItems, ...fillerItems].slice(0, HERO_ITEM_TARGET);

    const purpleGoldArticles = (lakersArticlesRaw || []).slice(0, 10);
    
    const purpleGoldItems = purpleGoldArticles.length > 0
      ? purpleGoldArticles.map(mapArticleToContentItem)
      : ownedContent.filter(item => 
          (item.title || '').toLowerCase().includes('laker') || 
          (item.source || '').toLowerCase().includes('laker')
        ).slice(0, 10);

    // Debug logging
    console.log('🔍 Data Check:', {
      allContentCount: allContent.length,
      ownedContentCount: ownedContent.length,
      externalContentCount: externalContent.length,
      trendingNowCount: trendingNow.length,
      aroundLeagueCount: aroundLeagueItems.length,
    });

    return (
      <main className="min-h-screen bg-[var(--netflix-bg)] pb-8 pt-[68px]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
          <QueueSetter episodes={podcastContent} />
          
          {/* Hero Row - Only on TDD */}
          {heroItems.length > 0 && (
            <ContentRowWithHero
              title="Only on TDD"
              items={heroItems}
              viewAllHref="/podcast"
              autoRotate={false}
            />
          )}

          {/* What's Happening Now - Last 24h */}
          {trendingNow.length > 0 && (
            <ContentRow
              title="What's Happening Now"
              items={trendingNow}
              viewAllHref="/news?filter=trending"
            />
          )}

          {/* Purple & Gold - Lakers Universe */}
          {purpleGoldItems.length > 0 && (
            <ContentRow
              title="Purple & Gold"
              items={purpleGoldItems}
              viewAllHref="/news?topic=lakers"
            />
          )}

          {/* Around the League - NBA Wide */}
          {aroundLeagueItems.length > 0 && (
            <ContentRow
              title="Around the League"
              description="Curated from top basketball sources"
              items={aroundLeagueItems}
              viewAllHref="/news?topic=nba"
              cardSize="small"
            />
          )}

          {/* Latest Videos */}
          {videoContent.length > 0 ? (
            <ContentRow
              title="Latest Videos"
              description="Exclusive video content from our YouTube channel"
              items={videoContent}
              viewAllHref="/videos"
            />
          ) : (
            <ComingSoonRow 
              title="Latest Videos"
              description="Exclusive video content from our YouTube channel"
            />
          )}

          {/* Coming Soon Rows */}
          <ComingSoonRow 
            title="Tech & Innovation"
            description="The latest in technology, AI, and innovation"
          />

          <ComingSoonRow 
            title="The Culture"
            description="Entertainment, music, and lifestyle beyond basketball"
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching content:", error);
    return (
      <main className="min-h-screen bg-[var(--netflix-bg)] py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">The Daily Dribble</h1>
          <p className="text-[var(--netflix-muted)]">Unable to load content. Please try again later.</p>
        </div>
      </main>
    );
  }
}