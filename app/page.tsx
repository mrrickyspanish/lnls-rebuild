import ContentRowWithHero from "@/components/home/ContentRowWithHero";
import HeroCarousel from "@/components/home/HeroCarousel";
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
    const [supabaseData, lakersArticlesRaw, nbaArticlesRaw, recruitReadyArticlesRaw, footballArticlesRaw, youtubeVideos] = await Promise.all([
      getNewsStream(50),
      getPublishedArticles(12, "Lakers"),
      getPublishedArticles(12, "NBA"),
      getPublishedArticles(12, "Recruit Ready"),
      getPublishedArticles(12, "Football"),
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
      author_name: item.author_name || undefined,
      author: item.author || undefined,
      topic: item.topic || undefined,
      featured: item.featured || undefined,
    }));

    const mapArticleToContentItem = (article: Article) => {
      // Normalize image URL - ensure relative paths start with /
      let imageUrl = article.hero_image_url || null;
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = `/${imageUrl}`;
      }
      
      return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || undefined,
        description: article.excerpt || undefined,
        image_url: imageUrl,
        content_type: "article" as const,
        source: "TDD",
        source_url: `/news/${article.slug}`,
        published_at: article.published_at || article.created_at,
        topic: article.topic || undefined, // Ensure topic is included for correct badge
      };
    };

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

    // Ensure all articles have topic field for correct badge logic
    const nbaArticles = (nbaArticlesRaw || []).map(mapArticleToContentItem);
    const lakersArticles = (lakersArticlesRaw || []).map(mapArticleToContentItem);
    const footballArticles = (footballArticlesRaw || []).map(mapArticleToContentItem);
    const recruitReadyArticlesFromDB = (recruitReadyArticlesRaw || []).map(mapArticleToContentItem);
    const allArticles = [...lakersArticles, ...nbaArticles, ...footballArticles, ...recruitReadyArticlesFromDB];

    const latestArticle = allArticles.length
      ? [...allArticles].sort((a, b) => toTimestamp(b.published_at) - toTimestamp(a.published_at))[0]
      : null;

    // Merge all content
    // Ensure supabaseItems also have topic if available (for uniformity)
    const supabaseItemsWithTopic = (supabaseData || []).map((item: any) => ({
      ...item,
      topic: item.topic || undefined,
    }));
    const allContent = [...supabaseItemsWithTopic, ...podcastContent, ...allArticles, ...videoContent];

    // Ensure all ownedContent items have topic for badge logic
    const ownedContent = filterOwnedContent(allContent).map(item => ({
      ...item,
      topic: item.topic || undefined,
    }));
    const externalContent = filterExternalContent(allContent);


    // --- FEATURED HERO LOGIC ---
    // Find all featured articles (using the 'featured' boolean property)
    const featuredArticles = dedupeById(sortByDateDesc(ownedContent)).filter(item => item.featured && item.image_url);
    
    // Find all "Recruit Ready" articles - always prioritized for hero
    const recruitReadyArticles = dedupeById(sortByDateDesc(ownedContent)).filter(item => item.topic === 'Recruit Ready' && item.image_url);

    // Trending Now - Owned Content Only, FEATURED and RECRUIT READY always included at the top
    const trendingNow = [
      ...featuredArticles,
      ...recruitReadyArticles.filter(item => !featuredArticles.find(f => f.id === item.id)), // Add Recruit Ready not already featured
      ...dedupeById(sortByDateDesc(ownedContent)).filter(item => !item.featured && item.topic !== 'Recruit Ready')
    ].map(item => ({
      ...item,
      topic: item.topic || undefined,
    })).slice(0, 10);

    // Around the League - External Content Only
    const aroundLeagueItems = dedupeById(sortByDateDesc(externalContent)).slice(0, 10);

    const HERO_ITEM_TARGET = 4;

    // SIMPLIFIED Hero Logic: Latest featured article first, then everything else by date
    let heroItems: ContentItem[] = [];

    // Get the single latest featured article if it exists
    const latestFeatured = featuredArticles.length > 0 ? featuredArticles[0] : null;

    // Get all owned content with images, sorted by date
    const ownedWithImages = dedupeById(sortByDateDesc(ownedContent))
      .filter(item => item.image_url);

    // Build hero: featured first (if exists), then rest by date
    if (latestFeatured) {
      // Featured article first, then other content (excluding the featured one)
      const otherContent = ownedWithImages.filter(item => item.id !== latestFeatured.id);
      heroItems = [latestFeatured, ...otherContent].slice(0, HERO_ITEM_TARGET);
    } else {
      // No featured article, just use latest content by date
      heroItems = ownedWithImages.slice(0, HERO_ITEM_TARGET);
    }

    const purpleGoldArticles = (lakersArticlesRaw || []).slice(0, 10);
    const purpleGoldItems = purpleGoldArticles.length > 0
      ? purpleGoldArticles.map(mapArticleToContentItem)
      : ownedContent.filter(item => 
          (item.title || '').toLowerCase().includes('laker') || 
          (item.source || '').toLowerCase().includes('laker')
        ).map(item => ({
          ...item,
          topic: item.topic || undefined,
        })).slice(0, 10);

    // Recruit Ready - Athlete features and recruiting content
    const recruitReadyItems = dedupeById(sortByDateDesc(ownedContent))
      .filter(item => item.topic === 'Recruit Ready')
      .slice(0, 10);

    // Debug logging
    console.log('🔍 Data Check:', {
      allContentCount: allContent.length,
      ownedContentCount: ownedContent.length,
      externalContentCount: externalContent.length,
      trendingNowCount: trendingNow.length,
      aroundLeagueCount: aroundLeagueItems.length,
      recruitReadyArticlesCount: recruitReadyArticles.length,
      recruitReadyItemsCount: recruitReadyItems.length,
      heroItemsCount: heroItems.length,
      heroItems: heroItems.map(h => ({ id: h.id, title: h.title, topic: h.topic, featured: h.featured })),
      recruitReadySample: recruitReadyArticles.slice(0, 2).map(r => ({ id: r.id, title: r.title, topic: r.topic })),
    });

    // --- JSON-LD Structured Data ---
    const siteUrl = 'https://lnls.media';
    const orgJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'The Daily Dribble',
      url: siteUrl,
      logo: `${siteUrl}/uploads/articles/dribbles_favicon_1.png`,
      sameAs: [
        'https://twitter.com/dailydribble',
        'https://www.youtube.com/@LateNightLakeShow',
      ],
    };
    // Article, Podcast, Video JSON-LD (for hero items only)
    const heroJsonLd = heroItems.map(item => {
      if (item.content_type === 'article') {
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: item.title,
          description: item.description,
          image: item.image_url ? [item.image_url] : undefined,
          author: item.author_name ? { '@type': 'Person', name: item.author_name } : undefined,
          datePublished: item.published_at,
          url: `${siteUrl}${item.source_url}`,
          publisher: { '@type': 'Organization', name: 'The Daily Dribble', logo: { '@type': 'ImageObject', url: `${siteUrl}/uploads/articles/dribbles_favicon_1.png` } },
        };
      } else if (item.content_type === 'podcast') {
        return {
          '@context': 'https://schema.org',
          '@type': 'PodcastEpisode',
          name: item.title,
          description: item.description,
          url: item.source_url,
          datePublished: item.published_at,
          image: item.image_url,
          partOfSeries: { '@type': 'PodcastSeries', name: 'Late Night Lake Show' },
        };
      } else if (item.content_type === 'video') {
        return {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: item.title,
          description: item.description,
          thumbnailUrl: item.image_url,
          uploadDate: item.published_at,
          url: item.source_url,
        };
      }
      return null;
    }).filter(Boolean);

    return (
      <main className="min-h-screen bg-[var(--netflix-bg)] pb-8 pt-[100px] md:pt-[180px]">
        {/* SEO: JSON-LD structured data for org and hero items */}
        <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify(orgJsonLd)}</script>
        {heroJsonLd.map((obj, i) => (
          <script key={i} type="application/ld+json" suppressHydrationWarning>{JSON.stringify(obj)}</script>
        ))}
        {/* Hero section: no horizontal padding or max-width */}
        {heroItems.length > 0 && (
          <ContentRowWithHero
            title=""
            items={heroItems}
          />
        )}
        {/* Main content container with padding and max-width */}
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
          <QueueSetter episodes={podcastContent} />
          {/* What's Happening Now - Last 24h */}
          {trendingNow.length > 0 && (
            <ContentRow
              title="What's Happening Now"
              items={trendingNow}
              viewAllHref="/news?filter=trending"
            />
          )}
          {/* Recruit Ready - Athlete features and recruiting content */}
          {recruitReadyItems.length > 0 ? (
            <ContentRow
              title="Recruit Ready"
              description="Athlete spotlights and recruiting coverage"
              items={recruitReadyItems}
              viewAllHref="/news?topic=recruit-ready"
            />
          ) : (
            <div className="my-8 p-4 bg-red-900/20 border border-red-500 rounded">
              <p className="text-white">DEBUG: No Recruit Ready items found. Count: {recruitReadyItems.length}</p>
              <p className="text-white text-sm">Fetched from DB: {recruitReadyArticlesFromDB.length}</p>
            </div>
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