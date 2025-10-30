import { createClient } from "@supabase/supabase-js";

const buildClient = (key: string | undefined) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key) {
    console.warn("Supabase env missing");
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
};

export const supabaseClient = () => buildClient(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabaseServiceClient = () => buildClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
