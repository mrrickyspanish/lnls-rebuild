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
import { getSiteUrl } from '@/lib/site';
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
    return <HeadingTag key={`heading-${index}`}>{block.text}</HeadingTag>;
  }

  return <p key={`paragraph-${index}`}>{block.text}</p>;
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  const hasTwitterEmbed = useMemo(() => {
    if (!content || !isTipTapDoc(content)) return false;
    return containsNodeType(content, 'twitterEmbed');
  }, [content]);

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

  if (!content) return null;

  if (isArticleBodyBlocks(content)) {
    return <div className="tdd-prose">{content.map(renderSupabaseBlock)}</div>;
  }

  if (isTipTapDoc(content)) {
    const html = retargetLinks(generateTipTapHTML(attachCaptions(content as JSONContent)));
    return <div className="tdd-prose" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return null;
}

/**
 * The editor saves a caption as a separate paragraph, set entirely in italics,
 * directly after the image (components/admin/RichTextEditor.tsx,
 * insertImageWithCaption). On the page that read as a stray italic sentence.
 * This folds it into the image node so it renders as a real <figcaption>.
 * Stored articles are not changed.
 */
function captionText(node: JSONContent | undefined): string | null {
  if (!node || node.type !== 'paragraph' || !node.content?.length) return null;
  const allItalic = node.content.every(
    (part) => part.type === 'text' && part.marks?.some((mark) => mark.type === 'italic')
  );
  if (!allItalic) return null;
  const text = node.content.map((part) => part.text ?? '').join('').trim();
  return text || null;
}

function attachCaptions(node: JSONContent): JSONContent {
  if (!node.content) return node;
  const children = node.content;
  const next: JSONContent[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === 'image') {
      const caption = captionText(children[i + 1]);
      if (caption) {
        const attrs: Record<string, any> = { ...(child.attrs ?? {}), title: caption };
        // Uploaded images are saved without alt text; the caption is the best
        // description available.
        if (!attrs.alt) attrs.alt = caption;
        next.push({ ...child, attrs });
        i++;
        continue;
      }
      next.push(child);
      continue;
    }
    next.push(attachCaptions(child));
  }
  return { ...node, content: next };
}

/** Images render as a figure, with the caption (stored as title) below. */
const FigureImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    const { title, ...attrs } = HTMLAttributes;
    if (!title) return ['img', attrs];
    return ['figure', { class: 'tdd-figure' }, ['img', attrs], ['figcaption', {}, title]];
  },
});

const SITE_HOSTS = new Set(
  [getSiteUrl(), 'https://thedailydribble.com', 'https://www.thedailydribble.com'].map((url) => {
    try {
      return new URL(url).host;
    } catch {
      return '';
    }
  })
);

/**
 * Every link used to open in a new tab, including links to other stories on
 * this site. Links to this site now open in place; links elsewhere still open
 * a new tab, with rel set so the other page can't reach back into this one.
 */
function retargetLinks(html: string): string {
  return html.replace(/<a\b([^>]*)>/g, (_tag, rawAttrs: string) => {
    const href = /\shref="([^"]*)"/.exec(rawAttrs)?.[1] ?? '';
    const attrs = rawAttrs.replace(/\s(?:target|rel)="[^"]*"/g, '');
    let internal = href.startsWith('/') && !href.startsWith('//');
    if (href.startsWith('#')) internal = true;
    if (!internal) {
      try {
        internal = SITE_HOSTS.has(new URL(href.replace(/&amp;/g, '&')).host);
      } catch {
        internal = false;
      }
    }
    return internal
      ? `<a${attrs}>`
      : `<a${attrs} target="_blank" rel="noopener noreferrer">`;
  });
}

function generateTipTapHTML(doc: JSONContent) {
  return generateHTML(doc, [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
    Underline,
    Link.configure({ openOnClick: true }),
    FigureImage,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    VideoEmbed,
    TwitterEmbed,
    CalloutCard,
  ])
}
