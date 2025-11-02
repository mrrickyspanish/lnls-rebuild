import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CHANNEL_ID = "UCQbrWKiffcmlcZjUWrthqBQ"; // LNLS
const API_KEY = process.env.YOUTUBE_API_KEY!;

type YTItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: { high?: { url?: string } };
    channelTitle?: string;
  };
};

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "Missing YOUTUBE_API_KEY" }, { status: 400 });
    }

    // Fetch YouTube
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", CHANNEL_ID);
    url.searchParams.set("order", "date");
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("type", "video");
    url.searchParams.set("key", API_KEY);

    const resp = await fetch(url.toString(), { cache: "no-store" });
    if (!resp.ok) {
      const body = await resp.text();
      return NextResponse.json({ error: `YouTube fetch failed: ${resp.status}`, body }, { status: 500 });
    }
    const data = await resp.json();
    const items: YTItem[] = data?.items ?? [];

    // Map to ai_news_stream rows
    const rows = items
      .map((it) => {
        const videoId = it?.id?.videoId;
        const s = it?.snippet;
        if (!videoId || !s?.title || !s?.publishedAt) return null;

        return {
          // Table columns expected:
          // id (uuid default) | title | summary | source | source_url | published_at | image_url (optional)
          title: s.title,
          summary: s.description ?? null,
          source: "YouTube",
          source_url: `https://youtu.be/${videoId}`,
          published_at: s.publishedAt,
          image_url: s.thumbnails?.high?.url ?? null,
        };
      })
      .filter(Boolean) as any[];

    // Upsert to Supabase using service role (server-only)
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only
    );

    // If you created a UNIQUE index on source_url, this will dedupe:
    // CREATE UNIQUE INDEX IF NOT EXISTS ai_news_stream_source_url_key ON ai_news_stream(source_url);
    const { data: upserted, error } = await supa
      .from("ai_news_stream")
      .upsert(rows, { onConflict: "source_url" })
      .select("source_url");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const upsertedSet = new Set((upserted ?? []).map((r: any) => r.source_url));
    let inserted = 0;
    let skipped = 0;
    for (const r of rows) {
      if (upsertedSet.has(r.source_url)) inserted++;
      else skipped++;
    }

    return NextResponse.json({
      ok: true,
      fetched: items.length,
      upserted: inserted,
      skipped,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "youtube ingest failed" }, { status: 500 });
  }
}
