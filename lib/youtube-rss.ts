import Parser from 'rss-parser';

export type YouTubeVideo = {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  pubDate: string;
  description: string;
};

const parser = new Parser({
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['yt:videoId', 'videoId'],
    ],
  },
});

function buildFeedUrl(feedId: string, feedType: 'playlist' | 'channel'): string {
  const queryKey = feedType === 'playlist' ? 'playlist_id' : 'channel_id';
  return `https://www.youtube.com/feeds/videos.xml?${queryKey}=${feedId}`;
}

function resolveYouTubeFeedConfig(explicitFeedId?: string): { id: string; type: 'playlist' | 'channel' } | null {
  const fromArg = explicitFeedId?.trim();
  if (fromArg) {
    return {
      id: fromArg,
      type: fromArg.startsWith('PL') ? 'playlist' : 'channel',
    };
  }

  const playlistId = process.env.YOUTUBE_PLAYLIST_ID?.trim();
  if (playlistId) {
    return { id: playlistId, type: 'playlist' };
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (channelId) {
    return { id: channelId, type: 'channel' };
  }

  return null;
}

export async function getYouTubeRSS(feedId?: string): Promise<YouTubeVideo[]> {
  const feed = resolveYouTubeFeedConfig(feedId);
  if (!feed) {
    console.warn('No YouTube feed ID provided (set YOUTUBE_PLAYLIST_ID or YOUTUBE_CHANNEL_ID)');
    return [];
  }

  try {
    const rss = await parser.parseURL(buildFeedUrl(feed.id, feed.type));
    
    return rss.items.map((item: any) => {
      const mediaGroup = item.mediaGroup || {};
      const thumbnail = mediaGroup['media:thumbnail']?.[0]?.['$']?.url || '';
      const description = mediaGroup['media:description']?.[0] || '';
      
      return {
        id: item.videoId,
        title: item.title,
        link: item.link,
        thumbnail: thumbnail,
        pubDate: item.pubDate,
        description: description,
      };
    });
  } catch (error) {
    console.error('Error fetching YouTube RSS:', error);
    return [];
  }
}
