"use client";

import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';

import { isArticleBodyBlocks } from '@/lib/articles/body';
import type { ArticleBodyBlock } from '@/types/supabase';

type ArticleBodyProps = {
  content: any; // Supabase blocks or Sanity PortableText
};

// Custom components for Sanity PortableText
const components = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-bold mt-12 mb-6 font-netflix">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-bold mt-8 mb-4 font-netflix">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-lg leading-relaxed mb-6 text-white/90">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[var(--netflix-red)] pl-6 py-4 my-8 text-2xl italic font-medium text-white/80 bg-white/5 rounded-r-lg">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{children}</em>
    ),
    link: ({ children, value }: any) => (
      <Link
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--netflix-red)] hover:underline"
      >
        {children}
      </Link>
    ),
  },
  types: {
    image: ({ value }: any) => (
      <div className="my-12 rounded-xl overflow-hidden bg-black/20">
        <Image
          src={value.url || value.asset?.url || 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=1200&h=675&fit=crop'}
          alt={value.alt || 'Article image'}
          width={1200}
          height={675}
          className="w-full h-auto object-cover"
        />
        {value.caption && (
          <p className="text-sm text-white/60 px-4 py-3 bg-black/40">
            {value.caption}
          </p>
        )}
      </div>
    ),
    video: ({ value }: any) => (
      <div className="my-12 aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={value.url}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    ),
  },
};

function renderSupabaseBlock(block: ArticleBodyBlock, index: number) {
  if (block.type === 'heading') {
    const HeadingTag = (block.level ?? 2) >= 3 ? 'h3' : 'h2';
    const headingClass =
      HeadingTag === 'h2'
        ? 'text-3xl font-bold mt-12 mb-6 font-netflix'
        : 'text-2xl font-bold mt-8 mb-4 font-netflix';
    return (
      <HeadingTag key={`heading-${index}`} className={headingClass}>
        {block.text}
      </HeadingTag>
    );
  }

  return (
    <p key={`paragraph-${index}`} className="text-lg leading-relaxed mb-6 text-white/90">
      {block.text}
    </p>
  );
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  if (!content) return null;

  if (isArticleBodyBlocks(content)) {
    return (
      <article className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-3xl mx-auto">
          {content.map(renderSupabaseBlock)}
        </div>
      </article>
    );
  }

  if (Array.isArray(content)) {
    return (
      <article className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none">
            <PortableText value={content} components={components} />
          </div>
        </div>
      </article>
    );
  }

  return null;
}