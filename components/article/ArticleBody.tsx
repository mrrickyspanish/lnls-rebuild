"use client";

import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

import { isArticleBodyBlocks, isTipTapDoc } from '@/lib/articles/body';
import { VideoEmbed } from '@/lib/tiptap/video-extension';
import ArticleSlideshow from './ArticleSlideshow';
import type { ArticleBodyBlock, TipTapDocNode } from '@/types/supabase';

type ArticleSlide = {
  image_url: string;
  caption: string;
  description?: string;
};

type Slideshow = {
  title: string;
  slides: ArticleSlide[];
};

type ArticleBodyProps = {
  content: any;
  slideshow?: Slideshow;
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

export default function ArticleBody({ content, slideshow }: ArticleBodyProps) {
  if (!content) return null;

  if (isArticleBodyBlocks(content)) {
    // Calculate midpoint for slideshow insertion (after ~40% of content)
    const insertIndex = Math.floor(content.length * 0.4);
    
    return (
      <article className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-3xl mx-auto">
          {content.slice(0, insertIndex).map(renderSupabaseBlock)}
          {slideshow && <ArticleSlideshow data={slideshow} />}
          {content.slice(insertIndex).map((block, idx) => renderSupabaseBlock(block, insertIndex + idx))}
        </div>
      </article>
    );
  }

  if (isTipTapDoc(content)) {
    const html = generateTipTapHTML(content);
    
    // For TipTap content, we'll insert slideshow after the HTML
    // A more sophisticated approach would parse and inject mid-content
    return (
      <article className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="prose prose-invert max-w-3xl mx-auto tiptap-article" dangerouslySetInnerHTML={{ __html: html }} />
        {slideshow && (
          <div className="max-w-3xl mx-auto">
            <ArticleSlideshow data={slideshow} />
          </div>
        )}
      </article>
    );
  }

  return null;
}

function generateTipTapHTML(doc: TipTapDocNode) {
  return generateHTML(doc as JSONContent, [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
    Underline,
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        class: 'text-red-400 underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Image.configure({ HTMLAttributes: { class: 'rounded-xl my-6 shadow-lg' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    VideoEmbed,
  ])
}