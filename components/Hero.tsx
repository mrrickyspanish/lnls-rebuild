import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import { ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface HeroProps {
  article: {
    title: string
    slug: { current: string }
    excerpt: string
    mainImage: any
    author: { name: string }
    publishedAt: string
  }
}

export default function Hero({ article }: HeroProps) {
  if (!article) return null

  return (
    <section className="relative bg-slate-secondary overflow-hidden">
      <div className="section-container py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 space-y-6 animate-fade-in">
            <div className="inline-block">
              <span className="text-neon-gold text-sm font-semibold tracking-wider uppercase">
                Featured Story
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bebas leading-tight">
              <span className="gradient-text">{article.title}</span>
            </h1>

            <p className="text-lg text-slate-muted max-w-xl">
              {article.excerpt}
            </p>

            <div className="flex items-center space-x-4 text-sm text-slate-muted">
              <span>{article.author.name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
            </div>

            <Link
              href={`/news/${article.slug.current}`}
              className="inline-flex items-center space-x-2 btn-primary group"
            >
              <span>Read Full Story</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 animate-slide-up">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-neon-purple/30 shadow-2xl shadow-neon-purple/20">
              {article.mainImage && (
                <Image
                  src={urlFor(article.mainImage).width(800).height(600).url()}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-gold/5 pointer-events-none" />
    </section>
  )
}
