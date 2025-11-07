import { XMLParser } from "fast-xml-parser";

export type PodcastItem = {
  id: string;
  title: string;
  excerpt?: string;
  image_url?: string | null;
  content_type: "podcast";
  source: "Podcast";
  source_url: string | null;
  published_at: string | null;
  audio_url?: string | null;
};

export async function fetchPodcasts(limit = 5): Promise<PodcastItem[]> {
  const url = process.env.PODCAST_RSS_URL;
  if (!url) return [];

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    processEntities: true,
    htmlEntities: true,
  });
  const data = parser.parse(xml);

  const channel = data?.rss?.channel;
  if (!channel) return [];

  const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);

  return items.slice(0, limit).map((it: any): PodcastItem => {
    const title = it?.title ?? "";
    const link = it?.link ?? null;
    const guid = typeof it?.guid === "object" ? it?.guid?.["#text"] || it?.guid : it?.guid;
    const pubDate = it?.pubDate ? new Date(it.pubDate).toISOString() : null;
    const enclosure = it?.enclosure?.url ?? null;
    const img = it?.["itunes:image"]?.href
      || channel?.["itunes:image"]?.href
      || channel?.image?.url
      || null;
    const desc = it?.description ?? it?.["itunes:summary"] ?? "";

    return {
      id: String(guid || link || title),
      title,
      excerpt: typeof desc === "string" ? desc : undefined,
      image_url: img || null,
      content_type: "podcast",
      source: "Podcast",
      source_url: link,
      published_at: pubDate,
      audio_url: enclosure,
    };
  });
}
