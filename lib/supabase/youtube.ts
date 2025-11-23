import { createSupabaseAnonClient } from './client';

export type YouTubeVideo = {
  id: number;
  video_id: string;
  title: string;
  description: string | null;
  published_at: string;
  thumbnail_url: string | null;
  duration: string | null;
  view_count: number;
  is_short: boolean;
  playlist_ids: string[];
  created_at: string;
  updated_at: string;
};

/**
 * Fetch latest non-short videos
 */
export async function getLatestVideos(limit = 12): Promise<YouTubeVideo[]> {
  const supabase = createSupabaseAnonClient();
  
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('is_short', false)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest videos:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch shorts only
 */
export async function getShorts(limit = 12): Promise<YouTubeVideo[]> {
  const supabase = createSupabaseAnonClient();
  
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('is_short', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching shorts:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch videos from specific playlist (Full Episodes)
 */
export async function getPlaylistVideos(playlistId: string, limit = 12): Promise<YouTubeVideo[]> {
  const supabase = createSupabaseAnonClient();
  
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .contains('playlist_ids', [playlistId])
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching playlist videos:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Parse ISO 8601 duration to seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format duration for display
 */
export function formatDuration(duration: string | null): string {
  if (!duration) return '';
  
  const totalSeconds = parseDuration(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
