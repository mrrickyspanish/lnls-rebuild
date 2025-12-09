"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { canUseNextImage } from '@/lib/images';

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  heroImage: string;
  imageCredit?: string | null;
  author: { name: string };
  publishedAt: string;
  readTime: number;
  topic: string;
};

type ArticleHeroProps = {
  currentArticle: Article;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function MediaLayer({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  // Always use <img> for /uploads/ images for reliability
  if (src.startsWith('/uploads/')) {
    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        style={{ borderRadius: '12px' }}
      />
    );
  }
  // Use Next.js <Image> for all other images
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className="object-cover"
      style={{ borderRadius: '12px' }}
    />
  );
}

export default function ArticleHero({ currentArticle }: ArticleHeroProps) {
  return (
    <section className="article-hero relative w-full">
      <div className="relative w-full h-[420px] md:h-[520px] xl:h-[620px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        >
          <MediaLayer src={currentArticle.heroImage} alt={currentArticle.title} priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black via-black/85 to-transparent" />
        </motion.div>

        {currentArticle.imageCredit && (
          <div className="absolute bottom-6 right-4 md:right-8 z-20">
            <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-white/80 border border-white/10">
              Photo: {currentArticle.imageCredit}
            </div>
          </div>
        )}

        <div className="relative z-10 h-full flex items-end">
          <div className="w-full px-4 md:px-8 lg:px-16 pb-10">
            <p className="hero-label text-white/80 text-[11px] md:text-xs uppercase tracking-[0.45em] mb-3">
              Only on TDD
            </p>
            <h1 className="hero-headline font-netflix text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl">
              {currentArticle.title}
            </h1>
            {currentArticle.excerpt && (
              <p className="mt-4 text-white/85 text-base md:text-lg max-w-3xl">
                {currentArticle.excerpt}
              </p>
            )}
            <div className="hero-meta mt-6 flex flex-wrap gap-3 text-sm text-white/75">
              <span>By {currentArticle.author.name}</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatDate(currentArticle.publishedAt)}</span>
              <span className="hidden sm:inline">•</span>
              <span>{currentArticle.readTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}