import { NextResponse } from "next/server";
import { getClient } from "@/lib/sanity/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([]);

  const client = getClient();

  // Articles
  const articles = await client.fetch(
    `*[
      _type == "article" &&
      status == "published" &&
      (title match $q || excerpt match $q || body[].children[].text match $q)
    ] | order(publishedAt desc)[0...5]{
      _id, "type": "article",
      title, "slug": slug.current,
      excerpt, mainImage, publishedAt,
      "author": author->name
    }`,
    { q: `${q}*` }
  );

  // Episodes
  const episodes = await client.fetch(
    `*[
      _type == "episode" &&
      (title match $q || description match $q)
    ] | order(publishedAt desc)[0...5]{
      _id, "type": "episode",
      title, "slug": slug.current,
      description, coverImage, publishedAt
    }`,
    { q: `${q}*` }
  );

  const results = [...articles, ...episodes].map((r: any) => ({
    id: r._id,
    type: r.type,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt ?? r.description ?? "",
    image: r.mainImage ?? r.coverImage ?? null,
    publishedAt: r.publishedAt,
    author: r.author ?? null,
  }));

  return NextResponse.json(results);
}
