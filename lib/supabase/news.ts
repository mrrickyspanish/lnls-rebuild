import { createClient } from "@supabase/supabase-js";

export async function getNewsStream(limit = 10) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supa = createClient(url, key);
  const { data } = await supa
    .from("ai_news_stream")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
