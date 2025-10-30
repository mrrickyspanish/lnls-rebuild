import { client, queries } from '@/lib/sanity/client'
import LatestEpisodes from '@/components/LatestEpisodes'

export const metadata = {
  title: 'Podcast',
  description: 'Listen to every episode of the Late Night Lake Show podcast.',
}

export const revalidate = 60

async function getEpisodes() {
  const episodes = await client.fetch(queries.episodes)
  return episodes
}

export default async function PodcastPage() {
  const episodes = await getEpisodes()

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-4">
          Podcast
        </h1>
        <p className="text-lg text-slate-muted max-w-2xl">
          Real talk about the Lakers, NBA, and basketball culture. New episodes every week.
        </p>

        {/* Podcast Platforms */}
        <div className="flex flex-wrap gap-4 mt-6">
          <a
            href="https://open.spotify.com/show/your-show-id"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            Listen on Spotify
          </a>
          <a
            href="https://podcasts.apple.com/us/podcast/your-podcast"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            Listen on Apple Podcasts
          </a>
          <a
            href="https://www.youtube.com/@latenightlakeshow"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            Watch on YouTube
          </a>
        </div>
      </div>

      {/* Episodes Grid */}
      <LatestEpisodes episodes={episodes} />
    </div>
  )
}
