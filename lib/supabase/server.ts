import { createServerClient } from "@supabase/ssr";

/**
 * Read-only server client for public feeds.
 * We pass no-op cookie handlers so SSR won't complain.
 */
export default function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (_name: string) => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
}
