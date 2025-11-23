export type ContentType = "article" | "podcast" | "video" | "news" | "newsletter" | "clip" | "highlight";

export interface HomeContentItem {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  image_url: string | null;
  content_type: ContentType | string;
  source?: string;
  source_url: string | null;
  published_at: string | null;
  duration?: string | null;
  episode_number?: number | null;
  audio_url?: string | null;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  published_at: string | null;
  duration?: string | null;
  episode_number?: number | null;
  audio_url: string;
}

export interface SearchResultItem {
  id: string;
  type: "article" | "episode";
  slug: string;
  title: string;
  image?: string | null;
  excerpt?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  readTime?: number;
}
