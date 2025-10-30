import type { SupabaseClient } from "@supabase/supabase-js";

export type AiNewsItem = {
  id: number;
  source: string;
  source_url: string;
  headline: string;
  summary: string;
  topics: string[];
  published_at: string;
  featured: boolean;
};

export const fetchAiNewsStream = async (client: SupabaseClient | null, limit = 12) => {
  if (!client) return [];
  const { data, error } = await client
    .from<AiNewsItem>("ai_news_stream")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Failed to load AI news stream", error);
    return [];
  }
  return data ?? [];
};
