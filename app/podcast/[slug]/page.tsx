import { notFound } from 'next/navigation'
import { client, queries, urlFor } from '@/lib/sanity/client'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Play, Clock, Calendar } from 'lucide-react'

export const revalidate = 60

interface EpisodePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: EpisodePageProps) {
  const episode = await client.fetch(queries.episodeBySlug(params.slug))
  
  if (!episode) return {}

  return {
    title: episode.title,
    description: episode.description,
    openGraph: {
      title: episode.title,
      description: episode.description,
      images: episode.coverImage
        ? [urlFor(episode.coverImage).width(1200).height(630).url()]
        : [],
    },
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const episode = await client.fetch(queries.episodeBySlug(params.slug))

  if (!episode) {
    notFound()
  }

  return (
    <article className="section-container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Episode Number */}
            {episode.episodeNumber && (
              <span className="text-sm font-semibold text-neon-gold uppercase tracking-wide">
                Episode {episode.episodeNumber}
              </span>
            )}

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bebas gradient-text my-4 leading-tight">
              {episode.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-slate-muted text-sm">
              {episode.hosts && episode.hosts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-offwhite font-semibold">
                    {episode.hosts.map((h: any) => h.name).join(' & ')}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(episode.publishedAt), 'MMMM d, yyyy')}</span>
              </div>

              {episode.duration && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{episode.duration}</span>
                </div>
              )}
            </div>

            {/* Audio Player */}
            {episode.audioUrl && (
              <div className="card mb-8">
                <audio controls className="w-full">
                  <source src={episode.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* YouTube Embed */}
            {episode.youtubeUrl && (
              <div className="aspect-video rounded-lg overflow-hidden mb-8 border border-neon-purple/30">
                <iframe
                  width="100%"
                  height="100%"
                  src={episode.youtubeUrl.replace('watch?v=', 'embed/')}
                  title={episode.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Description */}
            <div className="text-slate-muted mb-8">
              {episode.description}
            </div>

            {/* Show Notes */}
            {episode.showNotes && (
              <div className="mb-8">
                <h2 className="text-2xl font-bebas gradient-text mb-4">Show Notes</h2>
                <div className="article-content">
                  <PortableText value={episode.showNotes} />
                </div>
              </div>
            )}

            {/* Timestamps */}
            {episode.timestamps && episode.timestamps.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bebas text-offwhite mb-4">Timestamps</h3>
                <ul className="space-y-3">
                  {episode.timestamps.map((ts: any, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-neon-purple font-mono text-sm">
                        {ts.time}
                      </span>
                      <span className="text-slate-muted text-sm">
                        {ts.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Cover Image */}
            {episode.coverImage && (
              <div className="card mb-6">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={urlFor(episode.coverImage).width(500).url()}
                    alt={episode.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Hosts */}
            {episode.hosts && episode.hosts.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-lg font-bebas text-offwhite mb-4">Hosts</h3>
                <ul className="space-y-4">
                  {episode.hosts.map((host: any) => (
                    <li key={host.slug.current} className="flex items-center space-x-3">
                      {host.image && (
                        <Image
                          src={urlFor(host.image).width(40).height(40).url()}
                          alt={host.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-offwhite">{host.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guests */}
            {episode.guests && episode.guests.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bebas text-offwhite mb-4">Guests</h3>
                <ul className="space-y-2">
                  {episode.guests.map((guest: any, index: number) => (
                    <li key={index} className="text-slate-muted text-sm">
                      {guest.name}
                      {guest.twitter && (
                        <a
                          href={`https://twitter.com/${guest.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neon-purple ml-2 hover:text-neon-gold"
                        >
                          @{guest.twitter}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
