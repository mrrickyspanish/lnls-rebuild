import { NextResponse } from "next/server";
import { fetchPodcastEpisodes } from "../../../src/lib/sanity/fetchers";

export const runtime = "edge";

export async function GET() {
  const episodes = await fetchPodcastEpisodes();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://latenightlakeshow.com";

  const items = episodes
    .map((episode) => `
      <item>
        <title><![CDATA[${episode.title}]]></title>
        <link>${siteUrl}/podcast/${episode.slug}</link>
        <guid>${episode.slug}</guid>
        ${episode.audioUrl ? `<enclosure url="${episode.audioUrl}" type="audio/mpeg" />` : ""}
        ${episode.publishedAt ? `<pubDate>${new Date(episode.publishedAt).toUTCString()}</pubDate>` : ""}
        ${episode.duration ? `<itunes:duration>${episode.duration}</itunes:duration>` : ""}
      </item>
    `)
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
      <channel>
        <title>Late Night Lake Show</title>
        <link>${siteUrl}/podcast</link>
        <description>Late Night Lake Show podcast feed</description>
        ${items}
      </channel>
    </rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate"
    }
  });
}
