import { ExternalLink, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  published_at: string
  featured: boolean
  tags: string[]
}

interface NewsStreamProps {
  items: NewsItem[]
}

export default function NewsStream({ items }: NewsStreamProps) {
  if (!items || items.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-muted">Loading latest news...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="card group cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-neon-purple uppercase tracking-wide">
              {item.source}
            </span>
            {item.featured && (
              <TrendingUp className="w-4 h-4 text-neon-gold" />
            )}
          </div>

          <h3 className="text-lg font-bebas text-offwhite mb-2 group-hover:text-neon-purple transition-colors">
            {item.title}
          </h3>

          <p className="text-sm text-slate-muted mb-4 line-clamp-3">
            {item.summary}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-muted">
            <span>
              {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
            </span>
            <ExternalLink className="w-4 h-4 group-hover:text-neon-purple transition-colors" />
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-base px-2 py-1 rounded text-neon-gold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  )
}
