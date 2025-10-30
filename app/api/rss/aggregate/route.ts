import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'

const RSS_FEEDS = [
  'https://www.espn.com/espn/rss/nba/news',
  'https://www.silverscreenandroll.com/rss/index.xml',
  'https://lakersnation.com/feed/',
]

export async function GET(request: NextRequest) {
  try {
    const parser = new Parser()
    const allNews = []

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl)
        const items = feed.items.slice(0, 10).map(item => ({
          title: item.title || '',
          summary: item.contentSnippet || item.summary || '',
          source: feed.title || 'Unknown',
          url: item.link || '',
          published_at: item.pubDate || new Date().toISOString(),
          featured: false,
          tags: item.categories || [],
        }))
        allNews.push(...items)
      } catch (feedError) {
        console.error(`Error fetching feed ${feedUrl}:`, feedError)
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Batch upsert for efficiency
    const { error } = await supabase
      .from('ai_news_stream')
      .upsert(allNews, { onConflict: 'url' })

    if (error) throw error

    return NextResponse.json({
      success: true,
      itemsProcessed: allNews.length
    })
  } catch (error) {
    console.error('RSS aggregation error:', error)
    return NextResponse.json(
      { error: 'Failed to aggregate news' },
      { status: 500 }
    )
  }
}
