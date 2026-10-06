"use client";

import { useState } from 'react';

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  heroImage: string;
  heroVideo?: string | null;
  imageCredit?: string | null;
  author: { name: string };
  publishedAt: string;
  readTime: number;
  topic: string;
};

type ArticleHeroProps = {
  currentArticle: Article;
};

function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
}

/**
 * The page adds "Photo:" itself, so a credit typed as "Photo: Jane Doe" would
 * otherwise read "Photo: Photo: Jane Doe".
 */
function cleanCredit(credit?: string | null): string | null {
  const cleaned = credit?.replace(/^\s*(?:photo|image|credit)s?\s*(?:by\b|:)\s*/i, '').trim();
  return cleaned || null;
}

/**
 * Hero art is shown whole, at its own shape. Story art in this library ranges
 * from tall phone shots to wide banners, and much of it has words baked in, so
 * the old fixed 16:8 crop cut through faces and type, and a dark gradient sat
 * over the bottom half of every image even though no text was overlaid on it.
 * The frame now caps the height and letterboxes on the page color instead.
 */
export default function ArticleHero({ currentArticle }: ArticleHeroProps) {
  const [videoError, setVideoError] = useState(false);
  const heroVideo = currentArticle.heroVideo || undefined;
  const showVideo = !videoError && isDirectVideoUrl(heroVideo);
  const credit = cleanCredit(currentArticle.imageCredit);

  return (
    <figure className="tdd-story-hero">
      <div className="tdd-story-hero-frame">
        {showVideo ? (
          <video
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            poster={currentArticle.heroImage}
          />
        ) : (
          <img
            src={currentArticle.heroImage}
            alt={currentArticle.title}
            loading="eager"
            decoding="async"
          />
        )}
      </div>
      {credit && <figcaption className="tdd-story-credit">Photo: {credit}</figcaption>}
    </figure>
  );
}
