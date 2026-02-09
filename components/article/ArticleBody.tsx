"use client";

import { useEffect, useMemo } from 'react';
import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

import { isArticleBodyBlocks, isTipTapDoc } from '@/lib/articles/body';
import { VideoEmbed } from '@/lib/tiptap/video-extension';
import { TwitterEmbed } from '@/lib/tiptap/twitter-extension';
import { CalloutCard } from '@/lib/tiptap/callout-card-extension';
import type { ArticleBodyBlock, TipTapDocNode } from '@/types/supabase';

import type { ArticleBody } from '@/types/supabase';
type ArticleBodyProps = {
  content: ArticleBody;
};

function containsNodeType(node: TipTapDocNode | null | undefined, type: string): boolean {
  if (!node) return false;
  if (node.type === type) return true;
  if (!Array.isArray(node.content)) return false;
  return node.content.some((child) => containsNodeType(child as TipTapDocNode, type));
}

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

  const hasTwitterEmbed = useMemo(
    () => (isTipTapDoc(content) ? containsNodeType(content, 'twitterEmbed') : false),
    [content]
  );

  useEffect(() => {
    if (!hasTwitterEmbed || typeof window === 'undefined') return;

    const existingScript = document.querySelector(
      'script[src="https://platform.twitter.com/widgets.js"]'
    ) as HTMLScriptElement | null;

    const loadWidgets = () => {
      const twttr = (window as any).twttr;
      if (twttr?.widgets?.load) {
        twttr.widgets.load();
      }
    };

    if (existingScript) {
      loadWidgets();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = loadWidgets;
    document.body.appendChild(script);
  }, [hasTwitterEmbed]);

  if (isArticleBodyBlocks(content)) {
    return (
      <article className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {content.map(renderSupabaseBlock)}
        </div>
      </article>
    );
  }

  if (isTipTapDoc(content)) {
    const html = generateTipTapHTML(content);
    return (
      <article className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="prose prose-invert max-w-4xl mx-auto tiptap-article" dangerouslySetInnerHTML={{ __html: html }} />
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
    TwitterEmbed,
    CalloutCard,
  ])
}