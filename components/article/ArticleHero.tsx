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
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        loading={priority ? 'eager' : 'lazy'}
        style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
      />
    );
  }

  // DEBUG: If the image is from basketballforever, try <img> instead of <Image>
  if (src.includes('basketballforever.com')) {
    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        loading={priority ? 'eager' : 'lazy'}
        style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
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
      sizes="100vw"
      className="object-cover object-bottom"
      style={{ borderRadius: '12px' }}
    />
  );
}

export default function ArticleHero({ currentArticle }: ArticleHeroProps) {
  return (
    <section className="article-hero w-full flex justify-center px-4 md:px-8 lg:px-16 xl:px-32">
      <div className="relative w-full max-w-7xl aspect-[16/10] md:aspect-[16/8] rounded-xl overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        >
          <MediaLayer src={currentArticle.heroImage} alt={currentArticle.title} priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[5%] bg-gradient-to-t from-black via-black/85 to-transparent" />
        </motion.div>

        {currentArticle.imageCredit && (
          <div className="absolute bottom-4 right-4 md:right-8 z-20">
            <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-white/80 border border-white/10">
              Photo: {currentArticle.imageCredit}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}