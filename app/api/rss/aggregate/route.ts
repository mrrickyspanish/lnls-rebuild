import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'

const RSS_FEEDS = [
  'https://www.espn.com/espn/rss/nba/news',
  'https://www.silverscreenandroll.com/rss/index.xml',
  'https://lakersnation.com/feed/',
]

export async function GET(_request: NextRequest) {
  try {
    console.log('🔄 Starting RSS aggregation...')
    const parser = new Parser()
    const allNews = []

    for (const feedUrl of RSS_FEEDS) {
      try {
        console.log(`📡 Fetching feed: ${feedUrl}`)
        const feed = await parser.parseURL(feedUrl)
        console.log(`📰 Found ${feed.items?.length || 0} items in feed: ${feed.title}`)
        
        const items = feed.items.slice(0, 10).map(item => {
          // Parse the published date, but use current time if it's too old or invalid
          const pubDate = item.pubDate ? new Date(item.pubDate) : null;
          const now = new Date();
          const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
          
          // If no date or date is older than 3 days, use current timestamp
          // This handles RSS feeds with stale publication dates
          const published_at = !pubDate || pubDate < threeDaysAgo 
            ? now.toISOString() 
            : pubDate.toISOString();
          
          return {
            title: item.title || '',
            summary: item.contentSnippet || item.summary || '',
            source: feed.title || feedUrl.split('/')[2] || 'Unknown',
            url: item.link || '',
            published_at,
            featured: false,
            tags: item.categories || [],
          };
        });
        
        console.log(`✅ Processed ${items.length} items from ${feed.title}`)
        console.log(`📅 Sample dates: ${items.slice(0, 3).map(i => i.published_at).join(', ')}`)
        
        allNews.push(...items)
      } catch (feedError) {
        console.error(`❌ Error fetching feed ${feedUrl}:`, feedError)
      }
    }

    console.log(`📊 Total items to process: ${allNews.length}`)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // STEP 1: Delete ALL old articles
    console.log('🗑️ Deleting old articles...');
    const { error: deleteError } = await supabase
      .from('ai_news_stream')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
    } else {
      console.log('✅ Deleted all old articles');
    }

    // STEP 2: Insert fresh articles
    console.log('📝 Inserting fresh articles...');
    const currentTime = new Date().toISOString();

    const { data: insertedData, error: insertError } = await supabase
      .from('ai_news_stream')
      .insert(
        allNews.map(item => ({
          title: item.title,
          summary: item.summary,
          source: item.source,
          url: item.url,
          published_at: currentTime,
          tags: item.tags || []
        }))
      )
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert articles', details: insertError },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully inserted ${insertedData?.length || 0} articles`);
    console.log('📅 Sample new dates:', insertedData?.slice(0, 3).map(d => d.published_at));

    console.log('✅ RSS aggregation completed successfully')

    return NextResponse.json({
      success: true,
      itemsProcessed: allNews.length,
      itemsInserted: insertedData?.length || 0,
      feedsProcessed: RSS_FEEDS.length,
      sampleTitles: allNews.slice(0, 5).map(item => item.title),
      sampleDates: insertedData?.slice(0, 5).map(item => item.published_at)
    })
  } catch (error) {
    console.error('RSS aggregation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to aggregate news', details: message },
      { status: 500 }
    )
  }
}
