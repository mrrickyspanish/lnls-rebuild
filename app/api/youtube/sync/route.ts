import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!channelId || !apiKey) {
      return NextResponse.json(
        { error: 'YouTube credentials not configured' },
        { status: 500 }
      )
    }

    // Fetch latest videos from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`
    )

    if (!response.ok) {
      throw new Error('YouTube API request failed')
    }

    const data = await response.json()
    const videos = data.items || []

    // Lazy import and initialize Sanity client
    const { createClient } = await import('@sanity/client')
    const sanity = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    })

    // Sync to Sanity
    const syncedVideos = []
    for (const video of videos) {
      if (video.id.kind === 'youtube#video') {
        const videoDoc = {
          _type: 'video',
          title: video.snippet.title,
          videoId: video.id.videoId,
          description: video.snippet.description,
          publishedAt: video.snippet.publishedAt,
          thumbnail: video.snippet.thumbnails?.high?.url,
        }

        const existing = await sanity.fetch(
          `*[_type == "video" && videoId == $videoId][0]`,
          { videoId: video.id.videoId }
        )

        if (!existing) {
          await sanity.create(videoDoc)
          syncedVideos.push(videoDoc)
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedVideos.length,
      total: videos.length,
    })
  } catch (error) {
    console.error('YouTube sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync YouTube videos' },
      { status: 500 }
    )
  }
}
