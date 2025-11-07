import type { CardItem, ContentType } from "@/lib/types/content";

/** Minimal shape we expect from ai_news_stream */
type Row = {
  id: string | number;
  title: string;
  source_url?: string | null;
  image_url?: string | null;
  content_type?: string | null;
  published_at?: string | null;
  source?: string | null;
};

/** Map arbitrary content_type strings into our canonical set */
function normalizeType(raw?: string | null): ContentType {
  const t = (raw || "").toLowerCase();
  if (t.includes("laker")) return "lakers";
  if (t.includes("pod")) return "podcast";
  if (t.includes("vid") || t.includes("youtube")) return "video";
  if (t.includes("tech")) return "tech";
  if (t.includes("ent")) return "entertainment";
  return "article";
}

/** Supabase rows -> CardItem[] */
export function mapRows(rows: Row[]): CardItem[] {
  const items = (rows ?? []).map((r) => ({
    id: String(r.id),
    title: r.title,
    source_url: r.source_url ?? null,
    image_url: r.image_url ?? null,
    content_type: normalizeType(r.content_type),
    published_at: r.published_at ?? null,
    source: r.source ?? null,
  }));

  // Sort newest first (fallback to 0 when missing)
  items.sort((a, b) => {
    const da = a.published_at ? Date.parse(a.published_at) : 0;
    const db = b.published_at ? Date.parse(b.published_at) : 0;
    return db - da;
  });

  return items;
}
