import Parser from "rss-parser";

export type PodcastEpisode = {
  id: string;
  title: string;
  episode_number?: number;
  description: string;
  audio_url: string;
  published_at: string;
  image_url?: string;
  duration?: string;
};

// Extend the RSS parser types to include custom fields
type CustomItem = {
  episodeNumber?: number;
  duration?: string;
  image?: string | { href?: string; $?: { href?: string } };
  itunes?: {
    episode?: number;
    duration?: string;
    image?: string;
  };
};

type CustomFeed = {
  itunes?: {
    image?: string;
  };
};

const SPREAKER_FEED_URL =
  "https://www.spreaker.com/show/5195087/episodes/feed";

/**
 * Fetches and parses the Spreaker RSS feed for Late Night Lake Show.
 * Returns episodes sorted newest → oldest.
 */
export async function fetchSpreaker(): Promise<PodcastEpisode[]> {
  try {
    const parser: Parser<CustomFeed, CustomItem> = new Parser({
      customFields: {
        item: [
          ["itunes:episode", "episodeNumber"],
          ["itunes:duration", "duration"],
          ["itunes:image", "image"],
        ],
      },
    });

    const feed = await parser.parseURL(SPREAKER_FEED_URL);

    const episodes: PodcastEpisode[] = feed.items.map((item, index) => {
      // Extract episode number from title if not in metadata
      const episodeMatch = item.title?.match(/(?:Episode|Ep\.?)\s*(\d+)/i);
      const episodeNumber =
        item.episodeNumber ||
        item.itunes?.episode ||
        (episodeMatch ? parseInt(episodeMatch[1], 10) : undefined);

      // Get audio URL from enclosure
      const audioUrl = item.enclosure?.url || "";

      // Get image from iTunes or feed-level (ensure it's a string)
      let imageUrl: string | undefined;
      if (typeof item.image === 'string') {
        imageUrl = item.image;
      } else if (typeof item.image === 'object' && item.image?.href) {
        imageUrl = item.image.href;
      } else if (typeof item.image === 'object' && item.image?.$?.href) {
        imageUrl = item.image.$.href;
      } else if (typeof item.itunes?.image === 'string') {
        imageUrl = item.itunes.image;
      } else if (feed.itunes?.image) {
        imageUrl = String(feed.itunes.image);
      }

      return {
        id: item.guid || `episode-${index}`,
        title: item.title || "Untitled Episode",
        episode_number: episodeNumber,
        description: item.contentSnippet || item.summary || "",
        audio_url: audioUrl,
        published_at: item.pubDate || item.isoDate || new Date().toISOString(),
        image_url: imageUrl,
        duration: item.itunes?.duration || item.duration || undefined,
      };
    });

    // Sort newest → oldest
    return episodes.sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching Spreaker feed:", error);
    return [];
  }
}

/**
 * Gets the latest podcast episode (for Now Playing / Box 1/2).
 */
export async function getLatestEpisode(): Promise<PodcastEpisode | null> {
  const episodes = await fetchSpreaker();
  return episodes[0] || null;
}

/**
 * Checks if an episode is "new" (published within the last 7 days).
 */
export function isNewEpisode(publishedAt: string): boolean {
  const published = new Date(publishedAt);
  const now = new Date();
  const diffDays = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}
