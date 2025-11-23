import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Play, Clock } from 'lucide-react'

interface Episode {
  _id: string
  title: string
  slug: { current: string }
  episodeNumber?: number
  description: string
  coverImage?: string | null
  audioUrl?: string
  duration?: string
  publishedAt: string
  hosts: Array<{ name: string }>
}

interface LatestEpisodesProps {
  episodes: Episode[]
}

export default function LatestEpisodes({ episodes }: LatestEpisodesProps) {
  if (!episodes || episodes.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {episodes.map((episode) => (
        <Link
          key={episode._id}
          href={`/podcast/${episode.slug.current}`}
          className="group"
        >
          <article className="card h-full flex flex-col">
            {/* Cover Image with Play Button Overlay */}
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              {episode.coverImage ? (
                <Image
                  src={episode.coverImage}
                  alt={episode.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-neon-gold/20" />
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-slate-base/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-neon-purple flex items-center justify-center">
                  <Play className="w-8 h-8 text-slate-base fill-current" />
                </div>
              </div>
            </div>

            {/* Episode Number */}
            {episode.episodeNumber && (
              <span className="text-xs font-semibold text-neon-gold uppercase tracking-wide mb-2">
                Episode {episode.episodeNumber}
              </span>
            )}

            {/* Title */}
            <h3 className="text-xl font-bebas text-offwhite mb-2 group-hover:text-neon-purple transition-colors">
              {episode.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-muted mb-4 flex-grow line-clamp-3">
              {episode.description}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-slate-muted pt-4 border-t border-slate-muted/20">
              <div className="flex items-center space-x-4">
                {episode.hosts && episode.hosts.length > 0 && (
                  <span>{episode.hosts.map(h => h.name).join(', ')}</span>
                )}
                {episode.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{episode.duration}</span>
                  </div>
                )}
              </div>
              <span>
                {formatDistanceToNow(new Date(episode.publishedAt), { addSuffix: true })}
              </span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
