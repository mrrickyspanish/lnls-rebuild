import Parser from "rss-parser";
import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { supabaseServiceClient } from "../../../../src/lib/supabase/client";
import fs from "fs/promises";

export const runtime = "nodejs";

const KEYWORDS = ["lakers", "nba", "anthony davis", "lebron", "darvin ham", "los angeles"];

const parser = new Parser({ timeout: 10000 });

const loadGuidelines = async () => {
  try {
    return await fs.readFile("rules/ai_guidelines.md", "utf8");
  } catch (error) {
    console.warn("Unable to load ai_guidelines", error);
    return "You are LNLS Bot, an assistant summarizing NBA news.";
  }
};

export async function GET() {
  const sources = process.env.AI_NEWS_RSS_SOURCES?.split(",").filter(Boolean);
  if (!sources?.length) {
    return NextResponse.json({ message: "AI_NEWS_RSS_SOURCES missing", inserted: 0, skipped: 0 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ message: "AI ingestion offline", inserted: 0, skipped: 0 });
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const supabase = supabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase service unavailable", inserted: 0, skipped: 0 });
  }
  const guidelines = await loadGuidelines();

  let inserted = 0;
  let skipped = 0;

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.trim());
      for (const item of feed.items ?? []) {
        const url = item.link ?? item.guid;
        if (!url) continue;
        const headline = item.title ?? "";
        if (!KEYWORDS.some((keyword) => headline.toLowerCase().includes(keyword))) {
          skipped += 1;
          continue;
        }

        const { data: existing } = await supabase
          .from("ai_news_stream")
          .select("id")
          .eq("source_url", url)
          .maybeSingle();
        if (existing) {
          skipped += 1;
          continue;
        }

        const completion = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 400,
          temperature: 0.2,
          system: guidelines,
          messages: [
            {
              role: "user",
              content: `Summarize this Lakers/NBA news in 2-3 neutral sentences and provide 3 topic tags as an array. Headline: ${headline}. Description: ${item.contentSnippet ?? item.content}`
            }
          ]
        });

        const response = completion.content?.[0]?.text ?? "";
        const summaryMatch = response.match(/summary:\s*(.+)/i);
        const topicsMatch = response.match(/topics:\s*\[(.+)\]/i);
        const summary = summaryMatch ? summaryMatch[1].trim() : response.slice(0, 320);
        const topics = topicsMatch ? topicsMatch[1].split(/[,;]+/).map((topic) => topic.replace(/['"\]]/g, "").trim()) : [];

        await supabase.from("ai_news_stream").insert({
          source: feed.title ?? source,
          source_url: url,
          headline,
          summary,
          topics,
          published_at: item.isoDate ?? new Date().toISOString()
        });
        inserted += 1;
      }
    } catch (error) {
      console.error("Failed to parse RSS", source, error);
    }
  }

  return NextResponse.json({ inserted, skipped });
}
