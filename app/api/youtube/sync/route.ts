import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import Anthropic from '@anthropic-ai/sdk';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  isShort: boolean;
}

export async function GET(req: NextRequest) {
  try {
    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'YouTube API credentials not configured' 
        },
        { status: 500 }
      );
    }

    // Fetch latest videos from YouTube channel
    const videos = await fetchYouTubeVideos();
    
    // Process each video
    const results = {
      synced: 0,
      articles: 0,
      episodes: 0,
      errors: [] as string[],
    };

    for (const video of videos) {
      try {
        // Check if video already exists in Sanity
        const existing = await sanity.fetch(
          `*[_type == "episode" && youtubeUrl match $url][0]`,
          { url: `*${video.id}*` }
        );

        if (existing) {
          console.log(`Video ${video.id} already synced, skipping`);
          continue;
        }

        // Determine if this should be an episode or article
        if (video.isShort) {
          // Shorts don't get full episode treatment
          results.synced++;
          continue;
        }

        // Get video transcript if available
        const transcript = await getVideoTranscript(video.id);

        if (transcript && transcript.length > 500) {
          // Generate episode with show notes
          await createEpisodeFromVideo(video, transcript);
          results.episodes++;
        } else {
          // Generate article from video metadata
          await createArticleFromVideo(video);
          results.articles++;
        }

        results.synced++;
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        results.errors.push(`${video.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.synced} videos (${results.episodes} episodes, ${results.articles} articles)`,
      results,
    });
  } catch (error) {
    console.error('YouTube sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Fetch videos from YouTube Data API
async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', YOUTUBE_API_KEY);
  url.searchParams.set('channelId', YOUTUBE_CHANNEL_ID);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '10');
  url.searchParams.set('type', 'video');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }

  const data = await response.json();
  const videos: YouTubeVideo[] = [];

  for (const item of data.items) {
    const videoId = item.id.videoId;
    
    // Get video details including duration and stats
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.set('key', YOUTUBE_API_KEY);
    detailsUrl.searchParams.set('id', videoId);
    detailsUrl.searchParams.set('part', 'contentDetails,statistics');

    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = await detailsResponse.json();
    const videoDetails = detailsData.items?.[0];

    if (!videoDetails) continue;

    const duration = videoDetails.contentDetails.duration;
    const isShort = parseYouTubeDuration(duration) <= 60; // Shorts are ≤60s

    videos.push({
      id: videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: formatDuration(duration),
      viewCount: videoDetails.statistics.viewCount,
      isShort,
    });
  }

  return videos;
}

// Get video transcript (captions) from YouTube
async function getVideoTranscript(videoId: string): Promise<string | null> {
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/captions');
    url.searchParams.set('key', YOUTUBE_API_KEY);
    url.searchParams.set('videoId', videoId);
    url.searchParams.set('part', 'snippet');

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    
    // Note: Downloading actual caption content requires OAuth
    // For now, return null - can be enhanced with OAuth flow
    // This is a placeholder for when that's implemented
    return null;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

// Create Sanity episode from YouTube video with AI-generated show notes
async function createEpisodeFromVideo(video: YouTubeVideo, transcript: string) {
  // Generate show notes using AI
  const showNotes = await generateShowNotesFromTranscript(video, transcript);

  const episode = {
    _type: 'episode',
    title: video.title,
    slug: {
      _type: 'slug',
      current: slugify(video.title),
    },
    description: showNotes.summary || video.description,
    youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
    duration: parseDurationToSeconds(video.duration),
    publishedAt: video.publishedAt,
    showNotes: showNotes.topics.map(topic => ({
      _type: 'block',
      _key: Math.random().toString(36).substr(2, 9),
      style: 'normal',
      children: [{
        _type: 'span',
        text: `${topic.timestamp} - ${topic.topic}`,
        marks: [],
      }],
    })),
    topics: showNotes.topics.map(t => t.topic),
    featured: false,
  };

  return await sanity.create(episode);
}

// Create Sanity article from YouTube video
async function createArticleFromVideo(video: YouTubeVideo) {
  // Generate article content from video metadata using AI
  const articleContent = await generateArticleFromVideo(video);

  const article = {
    _type: 'article',
    title: articleContent.title || video.title,
    slug: {
      _type: 'slug',
      current: slugify(video.title),
    },
    excerpt: articleContent.excerpt,
    body: articleContent.body,
    publishedAt: video.publishedAt,
    featured: false,
    seo: {
      metaTitle: articleContent.seoTitle,
      metaDescription: articleContent.seoDescription,
    },
    // Mark as draft for review
    _status: 'draft',
  };

  return await sanity.create(article);
}

// AI: Generate show notes from transcript
async function generateShowNotesFromTranscript(
  video: YouTubeVideo,
  transcript: string
): Promise<{
  summary: string;
  topics: Array<{ timestamp: string; topic: string }>;
  keyQuotes: string[];
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Generate detailed show notes for this LNLS episode:

Title: ${video.title}
Description: ${video.description}

Transcript:
${transcript.substring(0, 4000)}

Provide:
1. A 2-3 sentence episode summary (conversational, NBA Twitter style)
2. Topic breakdown with timestamps (estimate timestamps based on content flow)
3. 3-5 memorable quotes or key moments

Format as JSON:
{
  "summary": "...",
  "topics": [
    { "timestamp": "00:00", "topic": "Opening discussion" },
    { "timestamp": "05:30", "topic": "Lakers game recap" }
  ],
  "keyQuotes": ["quote 1", "quote 2"]
}`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return {
      summary: video.description,
      topics: [],
      keyQuotes: [],
    };
  }

  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      summary: video.description,
      topics: [],
      keyQuotes: [],
    };
  } catch {
    return {
      summary: video.description,
      topics: [],
      keyQuotes: [],
    };
  }
}

// AI: Generate article from video metadata
async function generateArticleFromVideo(video: YouTubeVideo): Promise<{
  title: string;
  excerpt: string;
  body: any[];
  seoTitle: string;
  seoDescription: string;
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Convert this LNLS YouTube video into a 500-word article:

Title: ${video.title}
Description: ${video.description}
Views: ${video.viewCount}

Write in LNLS voice: conversational, analytical, NBA Twitter energy. Include:
- Hook paragraph (2-3 sentences)
- Main analysis (3-4 paragraphs)
- Conclusion with call-to-action to watch the full video

Format as JSON:
{
  "title": "...",
  "excerpt": "...",
  "body": "full article text here",
  "seoTitle": "...",
  "seoDescription": "..."
}`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Failed to generate article');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  if (!result) {
    throw new Error('Failed to parse AI response');
  }

  // Convert body text to Sanity blocks
  const bodyBlocks = result.body.split('\n\n').map((paragraph: string) => ({
    _type: 'block',
    _key: Math.random().toString(36).substr(2, 9),
    style: 'normal',
    children: [{
      _type: 'span',
      text: paragraph,
      marks: [],
    }],
  }));

  return {
    title: result.title,
    excerpt: result.excerpt,
    body: bodyBlocks,
    seoTitle: result.seoTitle,
    seoDescription: result.seoDescription,
  };
}

// Utility functions
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(duration: string): string {
  const seconds = parseYouTubeDuration(duration);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function parseDurationToSeconds(formatted: string): number {
  const parts = formatted.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parts[0] * 60 + parts[1];
}

// Manual trigger via POST
export async function POST(req: NextRequest) {
  return GET(req);
}
