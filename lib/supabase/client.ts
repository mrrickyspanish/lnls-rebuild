import { createClient } from '@supabase/supabase-js';

// Lazy client creation
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Helper functions
export async function subscribeToNewsletter(email: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email }])
    .select()
    .single();

  if (error) throw error;
  return { data, error: null };
}

export async function getNewsStream(limit = 10) {
  try {
    const supabase = getSupabaseClient();
    
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
  } catch (error) {
    console.error('Supabase client error:', error);
    return [];
  }
}
