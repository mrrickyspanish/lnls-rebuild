import Parser from "rss-parser";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sanityClient } from "../../../../src/lib/sanity/client";

export const runtime = "nodejs";

export async function GET() {
  const rssUrl = process.env.PODCAST_RSS_URL;
  if (!rssUrl) {
    return NextResponse.json({ message: "PODCAST_RSS_URL missing", inserted: 0 }, { status: 200 });
  }

  const client = sanityClient();
  if (!client) {
    return NextResponse.json({ message: "Sanity offline", inserted: 0 }, { status: 200 });
  }

  const parser = new Parser({ customFields: { item: [["itunes:duration", "itunesDuration"]] } });
  const feed = await parser.parseURL(rssUrl);

  let inserted = 0;
  for (const item of feed.items ?? []) {
    const guid = item.guid ?? item.id;
    if (!guid) continue;
    const docId = `podEpisode-${guid}`;
    await client.createOrReplace({
      _id: docId,
      _type: "podEpisode",
      title: item.title ?? "Untitled Episode",
      slug: { _type: "slug", current: (item.link ?? guid).split("/").slice(-1)[0] },
      audioUrl: item.enclosure?.url ?? item.link ?? "",
      duration: (item as any).itunesDuration ?? null,
      publishedAt: item.pubDate ?? null,
      externalGuid: guid,
      visibility: "public",
      meta: { status: "published" }
    });
    inserted += 1;
  }

  revalidatePath("/podcast");
  return NextResponse.json({ inserted });
}
