import ContentRowWithHero from "@/components/home/ContentRowWithHero";
import ContentRow from "@/components/home/ContentRow";
import ComingSoonRow from "@/components/home/ComingSoonRow";
import QueueSetter from "@/components/home/QueueSetter";
import { getPublishedArticles } from "@/lib/articles";
import { getNewsStream } from "@/lib/supabase/client";
import { getClient, queries } from "@/lib/sanity/client";
import { isYouTube } from "@/lib/heroSelector";
import type { Article } from "@/types/supabase";

export const revalidate = 60;

type SanityContent = {
  _id: string;
  _type: "article" | "episode" | "clip";
  title: string;
  slug?: { current: string };
  excerpt?: string;
  mainImage?: { asset: { url: string } };
  thumbnailUrl?: string;
  publishedAt?: string;
  source?: string;
  externalUrl?: string;
  videoUrl?: string;
};

export default async function HomePage() {
  // Always show a basic working version first
  const mockContent = [
    {
      id: 'mock-1',
      title: 'Welcome to Late Night Lake Show',
      description: 'Your ultimate destination for Lakers news, NBA analysis, and podcast content.',
      image_url: null,
      content_type: 'article' as const,
      source: 'LNLS',
      source_url: '/about',
      published_at: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      title: 'Latest Episode - Lakers Talk',
      description: 'Breaking down the latest Lakers games, trades, and roster moves.',
      image_url: null,
      content_type: 'podcast' as const,
      source: 'LNLS Podcast',
      source_url: '/podcast',
      published_at: new Date(Date.now() - 86400000).toISOString(),
      duration: '3600',
      episode_number: 1,
    },
    {
      id: 'mock-3',
      title: 'NBA Analysis & Highlights',
      description: 'Watch the latest NBA highlights and game analysis.',
      image_url: null,
      content_type: 'video' as const,
      source: 'LNLS',
      source_url: '/videos',
      published_at: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  try {
    const [supabaseData, lakersArticlesRaw, nbaArticlesRaw] = await Promise.all([
      getNewsStream(50),
      getPublishedArticles(12, "Lakers"),
      getPublishedArticles(12, "NBA"),
    ]);

    const client = getClient();

    const [articles, episodes, clips, podcastResponse] = await Promise.all([
      client.fetch<SanityContent[]>(
        `*[_type == "article"] | order(publishedAt desc)[0...20]{
          _id,_type,title,slug,excerpt,
          "mainImage": mainImage.asset->url,
          publishedAt,source,externalUrl
        }`
      ),
      client.fetch<SanityContent[]>(
        `*[_type == "episode"] | order(publishedAt desc)[0...10]{
          _id,_type,title,slug,excerpt,
          "mainImage": mainImage.asset->url,
          publishedAt,source
        }`
      ),
      client.fetch<SanityContent[]>(
        `*[_type == "clip"] | order(publishedAt desc)[0...10]{
          _id,_type,title,videoUrl,thumbnailUrl,
          publishedAt,source
        }`
      ),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/podcast/episodes`)
        .then(res => res.json())
        .then(data => data.success ? data.episodes : [])
        .catch(() => []),
    ]);

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
      source: "LNLS",
      source_url: `/news/${article.slug}`,
      published_at: article.published_at || article.created_at,
    });

    // Process Sanity data
    const sanityItems = [...articles, ...episodes, ...clips].map((item) => {
      let content_type: "article" | "podcast" | "video" = "article";
      if (item._type === "episode") content_type = "podcast";
      if (item._type === "clip") content_type = "video";

      return {
        id: item._id,
        title: item.title,
        excerpt: item.excerpt || undefined,
        description: item.excerpt || undefined,
        image_url: item.mainImage || item.thumbnailUrl || null,
        content_type,
        source: item.source || "LNLS",
        source_url:
          item.externalUrl ||
          item.videoUrl ||
          (item.slug ? `/news/${item.slug.current}` : null),
        published_at: item.publishedAt || null,
      };
    });

    // Convert podcast episodes from API to proper format
    const podcastContent = (podcastResponse || []).map((episode: any) => ({
      id: episode.id,
      title: episode.title,
      description: episode.description,
      image_url: episode.image_url,
      content_type: "podcast" as const,
      source: "LNLS Podcast",
      source_url: episode.audio_url, // Use audio URL as the link
      published_at: episode.published_at,
      duration: episode.duration,
      episode_number: episode.episode_number,
      audio_url: episode.audio_url, // Add for audio player
    }));

    // Merge all content
    const allContent = [...supabaseItems, ...sanityItems, ...podcastContent];

    // Content Filtering Strategy
    
    // 1. LNLS Content for Hero (< 8 days old)
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    const recentLNLS = allContent.filter((item) => {
      const isLNLS = 
        item.source?.toLowerCase().includes("lnls") || 
        item.source?.toLowerCase().includes("late night") ||
        (item.content_type === "podcast") ||
        (item.content_type === "video" && item.source?.toLowerCase().includes("youtube"));
      
      const isRecent = item.published_at 
        ? new Date(item.published_at) > eightDaysAgo 
        : false;
      
      return isLNLS && isRecent;
    });

    // Fallback: if no recent LNLS content, show latest 3
    const lnlsContent = recentLNLS.length > 0 
      ? recentLNLS.slice(0, 6)
      : allContent
          .filter(item => 
            item.source?.toLowerCase().includes("lnls") || 
            item.content_type === "podcast"
          )
          .slice(0, 3);

    // 2. What's Happening Now (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const trendingNow = allContent.filter((item) => {
      return item.published_at && new Date(item.published_at) > oneDayAgo;
    }).slice(0, 12); // Show up to 12 items

    // 3. Purple & Gold (Lakers only) - IMPROVED FILTER
    const lakersContent = allContent.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const source = (item.source || "").toLowerCase();
      const excerpt = (item.excerpt || "").toLowerCase();
      
      // Check multiple fields for Lakers keywords
      const hasLakers = 
        title.includes("laker") || 
        title.includes("lal") ||
        source.includes("laker") ||
        excerpt.includes("laker") ||
        title.includes("purple and gold") ||
        title.includes("staples") ||
        title.includes("crypto.com arena");
      
      // Exclude podcast episodes (already in hero)
      const isNotPodcast = item.content_type !== "podcast";
      
      return hasLakers && isNotPodcast;
    }).slice(0, 12);

    // 4. Around the League (NBA excluding Lakers) - IMPROVED FILTER
    const leagueContent = allContent.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const source = (item.source || "").toLowerCase();
      const excerpt = (item.excerpt || "").toLowerCase();
      
      // NBA keywords and team names
      const hasNBA = 
        title.includes("nba") || 
        source.includes("nba") ||
        title.includes("basketball") ||
        // Popular teams
        title.includes("warriors") ||
        title.includes("celtics") ||
        title.includes("heat") ||
        title.includes("bucks") ||
        title.includes("suns") ||
        title.includes("nuggets") ||
        title.includes("clippers") ||
        title.includes("knicks") ||
        title.includes("nets") ||
        title.includes("bulls") ||
        // NBA terms
        excerpt.includes("playoff") ||
        excerpt.includes("conference") ||
        source.includes("espn");
      
      // Exclude Lakers content
      const isNotLakers = 
        !title.includes("laker") && 
        !source.includes("laker");
      
      // Exclude podcast episodes
      const isNotPodcast = item.content_type !== "podcast";
      
      return hasNBA && isNotLakers && isNotPodcast;
    }).slice(0, 12);

    // Fallback content strategies
    const finalLakersContent = lakersContent.length > 0 
      ? lakersContent 
      : allContent
          .filter(item => item.content_type === "article")
          .slice(0, 6);

    const finalLeagueContent = leagueContent.length > 0
      ? leagueContent
      : allContent
          .filter(item => item.content_type === "article" && item.content_type !== "podcast")
          .slice(0, 6);

      const heroArticles = (lakersArticlesRaw || []).slice(0, 6);
      const purpleGoldArticles = (lakersArticlesRaw || []).slice(0, 10);
      const aroundLeagueArticles = (nbaArticlesRaw || []).slice(0, 10);

      const heroItems = heroArticles.length > 0
        ? heroArticles.map(mapArticleToContentItem)
        : lnlsContent;

      const fallbackLakersFromFeed = supabaseItems
        .filter((item) => (item.source || '').toLowerCase().includes('lakers'))
        .slice(0, 10);

      const purpleGoldItems = purpleGoldArticles.length > 0
        ? purpleGoldArticles.map(mapArticleToContentItem)
        : fallbackLakersFromFeed.length > 0
          ? fallbackLakersFromFeed
          : finalLakersContent;

      const fallbackLeagueFromFeed = supabaseItems
        .filter((item) => (item.source || '').toLowerCase().includes('nba'))
        .slice(0, 10);

      const aroundLeagueItems = aroundLeagueArticles.length > 0
        ? aroundLeagueArticles.map(mapArticleToContentItem)
        : fallbackLeagueFromFeed.length > 0
          ? fallbackLeagueFromFeed
          : finalLeagueContent;

    // Debug logging
    console.log('🔍 Data Check:', {
      allContentCount: allContent.length,
      lakersContentCount: lakersContent.length,
      leagueContentCount: leagueContent.length,
      finalLakersCount: finalLakersContent.length,
      finalLeagueCount: finalLeagueContent.length,
      sampleLakersTitle: finalLakersContent[0]?.title,
      sampleLeagueTitle: finalLeagueContent[0]?.title,
      allContentSample: allContent.slice(0, 3).map(item => ({ title: item.title, source: item.source, type: item.content_type })),
    });

    return (
      <main className="min-h-screen bg-[var(--netflix-bg)] pb-8 pt-[68px]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
          <QueueSetter episodes={podcastContent} />
          
          {/* Hero Row - Only on LNLS */}
          {heroItems.length > 0 && (
            <ContentRowWithHero
              title="Only on LNLS"
              items={heroItems}
              viewAllHref="/podcast"
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
              items={aroundLeagueItems}
              viewAllHref="/news?topic=nba"
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
          <h1 className="text-3xl font-bold text-white mb-4">Late Night Lake Show</h1>
          <p className="text-[var(--netflix-muted)]">Unable to load content. Please try again later.</p>
        </div>
      </main>
    );
  }
}