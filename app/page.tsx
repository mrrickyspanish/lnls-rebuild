import EditorialHome from '@/components/home/EditorialHome'
import QueueSetter from '@/components/home/QueueSetter'
import { getPublishedArticles } from '@/lib/articles'
import { fetchPodcastEpisodes } from '@/lib/podcast'
import { getYouTubeRSS } from '@/lib/youtube-rss'

export const revalidate = 60

export default async function HomePage() {
  // Fetch independent sources directly: a failed feed cannot hide published stories.
  const [articleResult, podcastResult, videoResult] = await Promise.allSettled([
    getPublishedArticles(24), fetchPodcastEpisodes(), getYouTubeRSS(),
  ])
  const articles = articleResult.status === 'fulfilled' ? articleResult.value.map(article => ({
    id: article.id, title: article.title, excerpt: article.excerpt || undefined,
    image_url: article.hero_image_url && !article.hero_image_url.startsWith('http') && !article.hero_image_url.startsWith('/') ? `/${article.hero_image_url}` : article.hero_image_url,
    source_url: `/news/${article.slug}`, content_type: 'article',
    published_at: article.published_at || article.created_at,
    topic: article.topic || undefined, author_name: article.author_name || undefined,
  })) : []
  const podcasts = podcastResult.status === 'fulfilled' ? podcastResult.value.map(episode => ({
    ...episode, excerpt: episode.description, source_url: episode.audio_url, content_type: 'podcast',
  })).filter(episode=>episode.audio_url) : []
  const videos = videoResult.status === 'fulfilled' ? videoResult.value.map(video => ({
    id:video.id, title:video.title, description:video.description, image_url:video.thumbnail,
    source_url:video.link, published_at:video.pubDate, content_type:'video',
  })) : []
  // Formatted on the server in a fixed zone so it cannot hydrate-mismatch,
  // and matches the UTC formatting used for story dates. `revalidate = 60`
  // keeps it current.
  const dateline = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
  return <div className="min-h-screen bg-[var(--bg-primary)]">
    <QueueSetter episodes={podcasts} />
    <EditorialHome articles={articles} podcasts={podcasts} videos={videos} dateline={dateline} />
  </div>
}
