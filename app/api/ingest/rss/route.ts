import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";
import { getOgImage } from "@/lib/og";

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

export async function GET() {
  try {
    const supa = getWriteClient();
    let inserted = 0, updated = 0, skipped = 0, ogApplied = 0;
    const feedsReport: { host: string; inserted: number; updated: number; skipped: number; ogApplied: number }[] = [];

    for (const feed of FEEDS) {
      const host = new URL(feed).hostname;
      let fIns = 0, fUpd = 0, fSkip = 0, fOg = 0;
      let items: any[] = [];
      try {
        items = await fetchFeed(feed);
      } catch {
        feedsReport.push({ host, inserted: 0, updated: 0, skipped: 0, ogApplied: 0 });
        continue;
      }

      for (const item of items) {
        const title =
          item?.title?.["#text"] ?? item?.title ?? item?.["media:title"]?.["#text"] ?? "";
        const link = item?.link?.href ?? item?.link ?? item?.guid ?? "";
        if (!title || !link) { fSkip++; continue; }

        // de-dupe by source_url
        const { data: exists, error: existsErr } = await supa
          .from("ai_news_stream")
          .select("id,image_url")
          .eq("source_url", link)
          .maybeSingle();

        const publishedRaw = item?.pubDate ?? item?.published ?? item?.updated ?? new Date().toISOString();
        const published_at = new Date(publishedRaw).toISOString();

        // try to read item image fields first
        const feedImg =
          item?.enclosure?.["@_url"] ||
          item?.["media:thumbnail"]?.["@_url"] ||
          item?.["media:content"]?.["@_url"] ||
          null;

        // Prepare row
        const row: any = {
          title,
          summary: null, // can wire summarizer later
          source: host,
          source_url: link,
          published_at,
          image_url: feedImg,
        };

        // If missing image, try OG scrape
        if (!row.image_url && row.source_url) {
          const og = await getOgImage(row.source_url);
          if (og) { row.image_url = og; fOg++; }
        }

        if (!existsErr && exists) {
          // optional: update missing image_url on existing record
          if (!exists.image_url && row.image_url) {
            const { error: updErr } = await supa
              .from("ai_news_stream")
              .update({ image_url: row.image_url })
              .eq("id", exists.id);
            if (!updErr) fUpd++; else fSkip++;
          } else {
            fSkip++;
          }
        } else {
          const { error: insErr } = await supa.from("ai_news_stream").insert(row);
          if (insErr) fSkip++; else fIns++;
        }
      }

      inserted += fIns; updated += fUpd; skipped += fSkip; ogApplied += fOg;
      feedsReport.push({ host, inserted: fIns, updated: fUpd, skipped: fSkip, ogApplied: fOg });
    }

    return NextResponse.json({ inserted, updated, skipped, ogApplied, feeds: feedsReport });
  } catch (e: any) {
    console.error("RSS ingest error:", e);
    return NextResponse.json({ error: e?.message ?? "ingest failed" }, { status: 500 });
  }
}
