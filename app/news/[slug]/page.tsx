import { notFound } from 'next/navigation'
import { client, queries, urlFor } from '@/lib/sanity/client'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Clock, Calendar, Tag, Share2 } from 'lucide-react'

export const revalidate = 60

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await client.fetch(queries.articleBySlug(params.slug))
  
  if (!article) return {}

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.mainImage
        ? [urlFor(article.mainImage).width(1200).height(630).url()]
        : [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await client.fetch(queries.articleBySlug(params.slug))

  if (!article) {
    notFound()
  }

  const portableTextComponents = {
    types: {
      image: ({ value }: any) => (
        <div className="relative w-full aspect-video my-8 rounded-lg overflow-hidden">
          <Image
            src={urlFor(value).width(1000).url()}
            alt={value.alt || 'Article image'}
            fill
            className="object-cover"
          />
          {value.caption && (
            <p className="text-sm text-slate-muted mt-2 text-center italic">
              {value.caption}
            </p>
          )}
        </div>
      ),
      code: ({ value }: any) => (
        <pre className="bg-slate-secondary p-4 rounded-lg overflow-x-auto my-6">
          <code className="text-sm text-neon-purple">{value.code}</code>
        </pre>
      ),
    },
    marks: {
      link: ({ value, children }: any) => (
        <a
          href={value.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-purple hover:text-neon-gold underline transition-colors"
        >
          {children}
        </a>
      ),
    },
  }

  return (
    <article className="section-container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Categories */}
        {article.categories && article.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.categories.map((category: any) => (
              <Link
                key={category.slug.current}
                href={`/news?category=${category.slug.current}`}
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  category.color === 'gold'
                    ? 'bg-neon-gold/20 text-neon-gold hover:bg-neon-gold/30'
                    : 'bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30'
                } transition-colors`}
              >
                {category.title}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-slate-muted text-sm">
          <div className="flex items-center space-x-3">
            {article.author.image && (
              <Image
                src={urlFor(article.author.image).width(50).height(50).url()}
                alt={article.author.name}
                width={50}
                height={50}
                className="rounded-full"
              />
            )}
            <div>
              <Link
                href={`/news?author=${article.author.slug.current}`}
                className="font-semibold text-offwhite hover:text-neon-purple transition-colors"
              >
                {article.author.name}
              </Link>
              <p className="text-xs">{article.author.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(article.publishedAt), 'MMMM d, yyyy')}</span>
          </div>
        </div>

        {/* Main Image */}
        {article.mainImage && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-12 border border-neon-purple/30">
            <Image
              src={urlFor(article.mainImage).width(1200).url()}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="text-xl text-slate-muted mb-8 pb-8 border-b border-slate-muted/20 italic">
            {article.excerpt}
          </div>
        )}

        {/* Body */}
        <div className="article-content">
          <PortableText value={article.body} components={portableTextComponents} />
        </div>

        {/* Author Bio */}
        {article.author.bio && (
          <div className="mt-12 pt-8 border-t border-slate-muted/20">
            <div className="flex items-start space-x-4">
              {article.author.image && (
                <Image
                  src={urlFor(article.author.image).width(80).height(80).url()}
                  alt={article.author.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-bebas text-offwhite mb-2">
                  About {article.author.name}
                </h3>
                <div className="text-slate-muted text-sm">
                  <PortableText value={article.author.bio} />
                </div>
                {article.author.social && (
                  <div className="flex space-x-4 mt-3">
                    {article.author.social.twitter && (
                      <a
                        href={`https://twitter.com/${article.author.social.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-purple hover:text-neon-gold transition-colors text-sm"
                      >
                        @{article.author.social.twitter}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
