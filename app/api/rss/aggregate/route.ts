import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const parser = new Parser();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// RSS Feed Sources
const RSS_SOURCES = [
  { 
    name: 'ESPN Lakers', 
    url: 'https://www.espn.com/espn/rss/nba/team/_/name/lal/los-angeles-lakers',
    category: 'Lakers'
  },
  { 
    name: 'The Athletic', 
    url: 'https://theathletic.com/feeds/rss/author/lakers/',
    category: 'Lakers'
  },
  { 
    name: 'Bleacher Report NBA', 
    url: 'https://bleacherreport.com/articles/feed?tag_id=18',
    category: 'NBA'
  },
  { 
    name: 'Lakers Nation', 
    url: 'https://www.lakersnation.com/feed',
    category: 'Lakers'
  },
  { 
    name: 'Silver Screen and Roll', 
    url: 'https://www.silverscreenandroll.com/rss/current',
    category: 'Lakers'
  },
  { 
    name: 'NBA.com News', 
    url: 'https://www.nba.com/news/rss.xml',
    category: 'NBA'
  },
];

// Keywords to filter for relevance
const RELEVANT_KEYWORDS = [
  'lakers', 'lebron', 'anthony davis', 'AD', 'lal', 'los angeles',
  'western conference', 'nba playoffs', 'trade deadline', 'free agency',
  'mvp', 'all-star', 'championship', 'finals'
];

interface RSSItem {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  creator?: string;
}

export async function GET(req: NextRequest) {
  try {
    const allArticles: Array<{
      title: string;
      link: string;
      source: string;
      category: string;
      publishedAt: string;
      excerpt: string;
    }> = [];

    // Fetch from all RSS sources
    for (const source of RSS_SOURCES) {
      try {
        const feed = await parser.parseURL(source.url);
        
        for (const item of feed.items.slice(0, 10)) {
          // Check relevance
          const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
          const isRelevant = RELEVANT_KEYWORDS.some(keyword => 
            text.includes(keyword.toLowerCase())
          );

          if (isRelevant) {
            allArticles.push({
              title: item.title || '',
              link: item.link || '',
              source: source.name,
              category: source.category,
              publishedAt: item.pubDate || new Date().toISOString(),
              excerpt: item.contentSnippet?.substring(0, 300) || '',
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${source.name}:`, error);
        continue;
      }
    }

    // Sort by date (newest first)
    allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Process top 15 articles with AI
    const processedArticles = await Promise.all(
      allArticles.slice(0, 15).map(article => processArticleWithAI(article))
    );

    // Store in Supabase
    const { data, error } = await supabase
      .from('ai_news_stream')
      .upsert(
        processedArticles.map(article => ({
          title: article.title,
          summary: article.summary,
          source_url: article.link,
          source_name: article.source,
          published_at: article.publishedAt,
          category: article.category,
          tags: article.tags,
          sentiment: article.sentiment,
          relevance_score: article.relevanceScore,
          status: 'pending',
        })),
        { 
          onConflict: 'source_url',
          ignoreDuplicates: true 
        }
      );

    if (error) {
      console.error('Supabase insert error:', error);
    }

    return NextResponse.json({
      success: true,
      processed: processedArticles.length,
      message: `Aggregated ${processedArticles.length} articles from ${RSS_SOURCES.length} sources`,
    });
  } catch (error) {
    console.error('RSS aggregation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Process article with AI for summary, sentiment, and relevance
async function processArticleWithAI(article: {
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  excerpt: string;
}): Promise<{
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceScore: number;
}> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Analyze this Lakers/NBA news article:

Title: ${article.title}
Source: ${article.source}
Excerpt: ${article.excerpt}

Provide:
1. A 2-sentence summary (conversational tone, NBA Twitter style)
2. 3-5 relevant tags (players, teams, topics)
3. Sentiment: positive, neutral, or negative (for Lakers fans)
4. Relevance score: 1-10 (how important is this for Lakers fans?)

Format as JSON:
{
  "summary": "...",
  "tags": ["tag1", "tag2", ...],
  "sentiment": "positive|neutral|negative",
  "relevanceScore": 8
}`
      }]
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in AI response');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      summary: article.excerpt.substring(0, 200),
      tags: [article.category],
      sentiment: 'neutral',
      relevanceScore: 5,
    };

    return {
      title: article.title,
      link: article.link,
      source: article.source,
      category: article.category,
      publishedAt: article.publishedAt,
      summary: analysis.summary,
      tags: analysis.tags,
      sentiment: analysis.sentiment,
      relevanceScore: analysis.relevanceScore,
    };
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback to basic processing
    return {
      title: article.title,
      link: article.link,
      source: article.source,
      category: article.category,
      publishedAt: article.publishedAt,
      summary: article.excerpt.substring(0, 200),
      tags: [article.category],
      sentiment: 'neutral',
      relevanceScore: 5,
    };
  }
}

// Manual trigger endpoint (POST)
export async function POST(req: NextRequest) {
  return GET(req);
}
