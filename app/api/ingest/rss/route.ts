import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";

const FEEDS = [
  "https://www.espn.com/espn/rss/nba/news",
  "https://www.nba.com/lakers/rss.xml",
];

function getWriteClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase server envs");
  return createClient(url, key);
}

async function fetchFeed(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Feed fetch failed: ${url}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? [];
  return Array.isArray(items) ? items : [items].filter(Boolean);
}

async function summarize(title: string, link: string) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return "";
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 120,
        messages: [{
          role: "user",
          content: `Summarize this headline + link in 2 concise sentences for Lakers/NBA readers. No fluff.\n\n${title}\n${link}`
        }],
      }),
    });
    if (!resp.ok) return "";
    const data = await resp.json();
    const text = data?.content?.[0]?.text ?? "";
    return (text || "").trim();
  } catch {
    return "";
  }
}

export async function GET() {
  try {
    const supa = getWriteClient();
    let inserted = 0, skipped = 0;
    const feedsReport: { host: string; inserted: number; skipped: number }[] = [];

    for (const feed of FEEDS) {
      let feedIns = 0, feedSkip = 0;
      let items: any[] = [];
      try {
        items = await fetchFeed(feed);
      } catch {
        feedsReport.push({ host: new URL(feed).hostname, inserted: 0, skipped: 0 });
        continue;
      }

      for (const item of items) {
        const title =
          item?.title?.["#text"] ?? item?.title ?? item?.["media:title"]?.["#text"] ?? "";
        const link = item?.link?.href ?? item?.link ?? item?.guid ?? "";
        if (!title || !link) { feedSkip++; continue; }

        const { data: exists, error: existsErr } = await supa
          .from("ai_news_stream")
          .select("id")
          .eq("source_url", link)
          .maybeSingle();

        if (existsErr || exists) { feedSkip++; continue; }

        const publishedRaw = item?.pubDate ?? item?.published ?? item?.updated ?? new Date().toISOString();
        const published_at = new Date(publishedRaw).toISOString();
        const summary = await summarize(title, link);

        const { error: insErr } = await supa.from("ai_news_stream").insert({
          title,
          summary,
          source: new URL(feed).hostname,
          source_url: link,
          published_at,
        });

        if (insErr) { feedSkip++; } else { feedIns++; }
      }

      inserted += feedIns; skipped += feedSkip;
      feedsReport.push({ host: new URL(feed).hostname, inserted: feedIns, skipped: feedSkip });
    }

    return NextResponse.json({ inserted, skipped, feeds: feedsReport });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "ingest failed" }, { status: 500 });
  }
}
