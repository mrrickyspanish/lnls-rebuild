import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug' },
        { status: 400 }
      );
    }

    // Get IP address for additional deduplication (optional)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Check user agent to filter obvious bots
    const userAgent = request.headers.get('user-agent') || '';
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper',
      'facebookexternalhit', 'twitterbot', 'linkedinbot',
      'slackbot', 'discordbot', 'telegrambot'
    ];
    
    const isBot = botPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    );

    if (isBot) {
      // Don't count bot views
      return NextResponse.json({ success: true, counted: false, reason: 'bot' });
    }

    // Increment view count in database
    const supabase = createSupabaseAnonClient();
    const { error } = await supabase.rpc('increment_article_views', { 
      article_slug: slug 
    });

    if (error) {
      console.error('Database error incrementing views:', error);
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      counted: true,
      ip: ip.substring(0, 8) + '...' // Log partial IP for debugging
    });
  } catch (error) {
    console.error('Error in track-view API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
