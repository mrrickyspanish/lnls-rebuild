"use client";

import { isArticleBodyBlocks } from '@/lib/articles/body';
import type { ArticleBodyBlock } from '@/types/supabase';

type ArticleBodyProps = {
  content: any;
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
  if (!content || !isArticleBodyBlocks(content)) return null;

  return (
    <article className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
      <div className="max-w-3xl mx-auto">
        {content.map(renderSupabaseBlock)}
      </div>
    </article>
  );
}