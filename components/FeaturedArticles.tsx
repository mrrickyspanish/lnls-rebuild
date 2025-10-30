import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import { formatDistanceToNow } from 'date-fns'
import { Clock } from 'lucide-react'

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  mainImage: any
  author: { name: string }
  publishedAt: string
  categories: Array<{ title: string; color: string }>
}

interface FeaturedArticlesProps {
  articles: Article[]
}

export default function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  if (!articles || articles.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {articles.map((article) => (
        <Link
          key={article._id}
          href={`/news/${article.slug.current}`}
          className="group"
        >
          <article className="card h-full flex flex-col">
            {/* Image */}
            {article.mainImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                <Image
                  src={urlFor(article.mainImage).width(600).height(400).url()}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Categories */}
            {article.categories && article.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {article.categories.slice(0, 2).map((category) => (
                  <span
                    key={category.title}
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      category.color === 'gold'
                        ? 'bg-neon-gold/20 text-neon-gold'
                        : 'bg-neon-purple/20 text-neon-purple'
                    }`}
                  >
                    {category.title}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-bebas text-offwhite mb-3 group-hover:text-neon-purple transition-colors">
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-slate-muted mb-4 flex-grow line-clamp-3">
              {article.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-sm text-slate-muted pt-4 border-t border-slate-muted/20">
              <span className="font-medium">{article.author.name}</span>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
