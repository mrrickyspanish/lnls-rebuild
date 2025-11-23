export type Episode = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url?: string;
  published_at: string;
  duration: number;
  episode_number?: number;
  hosts?: string;
  topics?: string[];
};

async function parseSpreaker(): Promise<Episode[]> {
  const RSS_URL = process.env.SPREAKER_RSS_URL || 'https://www.spreaker.com/show/5195087/episodes/feed';

  const response = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'LNLS-Platform/1.0' },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }

  const xmlText = await response.text();
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

  const episodes: Episode[] = items.map((item, index) => {
    const getTag = (tag: string) => {
      const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
      let content = match ? match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';

      content = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&nbsp;/g, ' ');

      content = content.replace(/<[^>]*>/g, '');
      content = content.replace(/\s+/g, ' ').trim();

      return content;
    };

    const getAttr = (tag: string, attr: string) => {
      const match = item.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`));
      return match ? match[1] : '';
    };

    const title = getTag('title');
    const description = getTag('description') || getTag('itunes:summary');
    const audioUrl = getTag('enclosure') || getAttr('enclosure', 'url');
    const imageUrl = getAttr('itunes:image', 'href') || getTag('image');
    const pubDate = getTag('pubDate');
    const durationStr = getTag('itunes:duration');
    const guid = getTag('guid');

    let duration = 0;
    if (durationStr) {
      const timeParts = durationStr.split(':').map((p) => parseInt(p) || 0);
      if (timeParts.length === 3) {
        duration = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      } else if (timeParts.length === 2) {
        duration = timeParts[0] * 60 + timeParts[1];
      }
    }

    const episodeMatch = title.match(/(?:Ep\.?|Episode)\s*(\d+)/i);
    const episodeNumber = episodeMatch ? parseInt(episodeMatch[1]) : items.length - index;

    const content = `${title} ${description}`.toLowerCase();
    const topics = [] as string[];
    if (content.includes('lakers')) topics.push('Lakers');
    if (content.includes('nba') || content.includes('basketball')) topics.push('NBA');
    if (content.includes('guest') || content.includes('interview')) topics.push('Guests');
    if (content.includes('trade') || content.includes('deadline')) topics.push('Trades');
    if (content.includes('rookie') || content.includes('draft')) topics.push('Rookies');

    return {
      id: guid || `episode-${index}`,
      title,
      description,
      audio_url: audioUrl,
      image_url:
        imageUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
      published_at: pubDate,
      duration,
      episode_number: episodeNumber,
      hosts: 'Ricky & Kwame',
      topics,
    };
  });

  const filteredEpisodes = episodes.filter((ep) => ep.title && ep.audio_url);
  filteredEpisodes.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return filteredEpisodes;
}

/**
 * Fetch podcast episodes from Spreaker RSS feed
 * @param limit Optional limit on number of episodes to return (default: all)
 */
export async function fetchPodcastEpisodes(limit?: number): Promise<Episode[]> {
  try {
    const episodes = await parseSpreaker();
    return limit ? episodes.slice(0, limit) : episodes;
  } catch (error) {
    console.error('Podcast episodes fetch error:', error);

    const sampleEpisodes: Episode[] = [
      {
        id: '1',
        title: 'Lakers Championship Hopes: Mid-Season Analysis',
        description:
          'Deep dive into the Lakers current roster construction, trade possibilities, and championship aspirations for this season.',
        audio_url: 'https://example.com/episode-1.mp3',
        image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
        published_at: '2024-11-15T00:00:00Z',
        duration: 3600,
        episode_number: 209,
        hosts: 'Ricky & Kwame',
        topics: ['Lakers', 'NBA', 'Championship'],
      },
    ];

    return limit ? sampleEpisodes.slice(0, limit) : sampleEpisodes;
  }
}
