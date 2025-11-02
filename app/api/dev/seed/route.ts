import { NextResponse } from "next/server";
import { getWriteClient } from "@/lib/sanity/client";

export async function GET() {
  try {
    const client = getWriteClient(); // requires SANITY_API_TOKEN
    const now = new Date().toISOString();
    const n = Date.now();

    const article = {
      _type: "article",
      _id: `seed-article-${n}`,
      title: "Lakers Test Post — Hello Search",
      slug: { current: `lakers-test-${n}` },
      excerpt: "This is a seeded article to validate search.",
      publishedAt: now,
      status: "published",
      body: [
        {
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: "Seeded content for LNLS search." }],
        },
      ],
    };

    const episode = {
      _type: "episode",
      _id: `seed-episode-${n}`,
      title: "Lakers Podcast Test — Search Ready",
      slug: { current: `lakers-episode-${n}` },
      description: "Seeded episode so the search endpoint returns results.",
      publishedAt: now,
    };

    const res = await client.createIfNotExists(article);
    const res2 = await client.createIfNotExists(episode);

    return NextResponse.json({ ok: true, created: [res._id, res2._id] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "seed failed" }, { status: 500 });
  }
}
