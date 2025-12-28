
import { createSupabaseAnonClient } from '@/lib/supabase/client';
import type { YouTubeVideoRow } from '@/types/supabase';

export async function getYouTubeVideoBySlug(slug: string): Promise<YouTubeVideoRow | null> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('video_id', slug)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch video by slug:', error);
    return null;
  }
  return data as YouTubeVideoRow | null;
}

export async function incrementVideoViews(slug: string): Promise<void> {
  const supabase = createSupabaseAnonClient();
  // First get the current views count
  const { data: video } = await supabase
    .from('youtube_videos')
    .select('view_count')
    .eq('video_id', slug)
    .single();
  if (video) {
    const { error } = await supabase
      .from('youtube_videos')
      .update({ view_count: (video.view_count || 0) + 1 })
      .eq('video_id', slug);
    if (error) {
      console.error('Failed to increment video views:', error);
    }
  }
}
