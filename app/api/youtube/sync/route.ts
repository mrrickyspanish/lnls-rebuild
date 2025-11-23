import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import { parseDuration } from '@/lib/supabase/youtube'

const PLAYLIST_ID = 'PLiOrRDJyF1LnL-6ogW743LfT8hYrqRcp3'

export async function GET() {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!channelId || !apiKey) {
      return NextResponse.json(
        { error: 'YouTube credentials not configured' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=50&type=video`
    )

    if (!searchResponse.ok) {
      throw new Error('YouTube API search request failed')
    }

    const searchData = await searchResponse.json()
    const videos = searchData.items || []
    const videoIds = videos.map((v: any) => v.id.videoId).join(',')

    if (!videoIds) {
      return NextResponse.json({ success: true, synced: 0, updated: 0, total: 0 })
    }

    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=contentDetails,statistics,snippet`
    )

    if (!detailsResponse.ok) {
      throw new Error('YouTube API details request failed')
    }

    const detailsData = await detailsResponse.json()
    const videoDetails = detailsData.items || []

    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${PLAYLIST_ID}&part=snippet&maxResults=50`
    )

    const playlistData = playlistResponse.ok ? await playlistResponse.json() : { items: [] }
    const playlistVideoIds = new Set(
      (playlistData.items || []).map((item: any) => item.snippet.resourceId.videoId)
    )

    let syncedCount = 0
    let updatedCount = 0

    for (const video of videoDetails) {
      const videoId = video.id
      const duration = video.contentDetails.duration
      const durationSeconds = parseDuration(duration)
      const isShort = durationSeconds > 0 && durationSeconds <= 60
      const playlistIds = playlistVideoIds.has(videoId) ? [PLAYLIST_ID] : []

      const videoDoc = {
        video_id: videoId,
        title: video.snippet.title,
        description: video.snippet.description || null,
        published_at: video.snippet.publishedAt,
        thumbnail_url: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
        duration,
        view_count: parseInt(video.statistics.viewCount || '0'),
        is_short: isShort,
        playlist_ids: playlistIds,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('youtube_videos')
        // @ts-expect-error - Supabase types are tricky with upsert
        .upsert(videoDoc, { onConflict: 'video_id' })

      if (error) {
        console.error(`Failed to sync video ${videoId}:`, error)
        continue
      }

      const { data: existing } = await supabase
        .from('youtube_videos')
        .select('created_at, updated_at')
        .eq('video_id', videoId)
        .single()

      if (existing) {
        // @ts-expect-error - Supabase types inference issue
        if (existing.created_at === existing.updated_at) {
          syncedCount++
        } else {
          updatedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      updated: updatedCount,
      total: videoDetails.length,
    })
  } catch (error) {
    console.error('YouTube sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync YouTube videos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
