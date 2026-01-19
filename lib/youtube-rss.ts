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

export async function getYouTubeRSS(playlistId: string = process.env.YOUTUBE_PLAYLIST_ID || ''): Promise<YouTubeVideo[]> {
  if (!playlistId) {
    console.warn('No YouTube Playlist ID provided');
    return [];
  }

  try {
    const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`);
    
    return feed.items.map((item: any) => {
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
