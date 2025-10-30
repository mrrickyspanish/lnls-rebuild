import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper functions
export async function subscribeToNewsletter(email: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNewsStream(limit = 10) {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('ai_news_stream')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching news stream:', error);
    return [];
  }

  return data || [];
}
