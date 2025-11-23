// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type SupabaseTypedClient = SupabaseClient<Database>;

/**
 * Public (anon) client — safe for reads the client can do.
 * Use this for SELECTs on public tables/views.
 */
export function createSupabaseAnonClient(): SupabaseTypedClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase anon credentials not configured");
  return createClient<Database>(url, anon, { auth: { persistSession: false } });
}

/**
 * Service-role client — SERVER ONLY.
 * Use for inserts/updates that RLS might block.
 * Never import this into client components.
 */
export function createSupabaseServiceClient(): SupabaseTypedClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error("Supabase service credentials not configured");
  return createClient<Database>(url, service, { auth: { persistSession: false } });
}

/**
 * Insert a subscriber. Returns PostgrestError | null per call site expectations.
 */
export async function subscribeToNewsletter(
  email: string,
  source: string = "site"
): Promise<{ data: unknown; error: PostgrestError | null }> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    // @ts-expect-error - Supabase types inference issue
    .insert([{ email, source }]);

  return { data, error };
}

/**
 * Read the AI news stream via anon client.
 */
export async function getNewsStream(limit = 10): Promise<any[]> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from("ai_news_stream")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching news stream:", error);
    return [];
  }
  return data ?? [];
}
