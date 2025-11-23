import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { fetchPublishedArticles } from '@/lib/supabase/articles';
import type { Article } from '@/types/supabase';

async function getArticles(): Promise<Article[]> {
  return fetchPublishedArticles(12);
}

const categoryColors: Record<string, string> = {
  Lakers: 'border-orange-500 text-orange-500',
  NBA: 'border-blue-500 text-blue-500',
  Tech: 'border-purple-500 text-purple-500',
  Culture: 'border-pink-500 text-pink-500',
};

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const metadata = {
  title: 'News – The Daily Dribble',
  description: 'The pulse of the game. Every angle. Every day.',
};

export default async function NewsPage() {
  const articles = await getArticles();

  return (
    <section className="relative min-h-screen">
      {/* HERO — title top-left, cinematic but clean */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pb-48">
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-32">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
            News
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-[var(--text-secondary)] max-w-xl">
            Every angle. Every day.
          </p>
        </div>
      </div>

      {/* CONTENT — clean overlay, no navbar bleed */}
      <div className="relative z-20 pt-56 md:pt-64 px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          {articles.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-surface/70 backdrop-blur">
              <p className="text-[var(--text-secondary)] text-xl">No articles yet. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, i) => {
                  const isHero = i === 0;
                  const colorClass = categoryColors[article.topic] || 'border-white/30 text-white/70';

                  return (
                    <Link href={`/news/${article.slug}`} key={article.id}>
                      <article className={`group relative overflow-hidden rounded-2xl bg-surface/95 backdrop-blur-sm border border-[var(--border-subtle)] transition-all hover:border-primary/60 hover:shadow-[var(--glow-orange)] ${isHero ? 'lg:row-span-2 lg:col-span-1' : ''}`}>
                        <div className={`relative ${isHero ? 'aspect-[3/4]' : 'aspect-[4/3]'} overflow-hidden`}>
                          {article.hero_image_url ? (
                            <>
                              <Image
                                src={article.hero_image_url}
                                alt={article.title}
                                fill
                                className="object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                  <BookOpen className="w-7 h-7 text-white" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                              <BookOpen className="w-16 h-16 text-white/10" />
                            </div>
                          )}
                        </div>
                        <div className="p-6 space-y-3">
                          <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase ${colorClass}`}>
                            {(article.topic || 'NBA').toUpperCase()}
                          </span>
                          <h2 className={`font-display font-bold text-white group-hover:text-primary transition line-clamp-3 ${isHero ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
                            {article.title}
                          </h2>
                          {article.excerpt && <p className="text-[var(--text-secondary)] line-clamp-3 text-sm">{article.excerpt}</p>}
                          <time className="text-sm text-[var(--text-tertiary)] block">
                            {formatDate(article.published_at)} • {article.read_time} min read
                          </time>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-16 text-center">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition">
                  Load More <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}