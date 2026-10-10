import { getSiteUrl } from '@/lib/site'
// app/news/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleHero from "@/components/article/ArticleHero";
import ArticleBody from "@/components/article/ArticleBody";
import RelatedStories from "@/components/article/RelatedStories";
import NewsletterSignup from "@/components/NewsletterSignup";
import AuthorCard from "@/components/article/AuthorCard";
import ShareBar from "@/components/article/ShareBar";
import ReadProgress from "@/components/article/ReadProgress";
import BackToTop from "@/components/article/BackToTop";
import ViewTracker from "@/components/article/ViewTracker";
import { fetchArticleBySlug, fetchRelatedArticles, fetchPublishedArticles } from "@/lib/supabase/articles";
import type { Article } from "@/types/supabase";
import { isArticleTopic, topicFamily } from "@/lib/topics";
import { noteKindLabel, pieceTypeInfo } from "@/lib/articles/piece-type";
import { SITE_OWNER, SITE_OWNER_X_URL, isSiteOwner } from "@/lib/author";

function longDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

type ArticleSlide = {
  image_url: string;
  caption: string;
  description?: string;
};

type ArticleWithSlideshow = Article & {
  views?: number;
  slideshow?: {
    title: string;
    slides: ArticleSlide[];
  } | null;
};

export const revalidate = 60;

type RouteParams = { slug: string };
type PageProps = { params: Promise<RouteParams> };

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=675&fit=crop";

function buildHeroArticle(article: ArticleWithSlideshow, slug: string) {
  return {
    slug,
    title: article.title,
    excerpt: article.excerpt || "",
    heroImage: article.hero_image_url || FALLBACK_IMAGE,
    heroVideo: article.video_url || null,
    imageCredit: article.image_credit,
    author: { name: article.author_name },
    publishedAt: article.published_at || article.created_at,
    readTime: article.read_time || 5,
    topic: article.topic || "Lakers",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  const siteUrl = getSiteUrl();
  const url = `${siteUrl.replace(/\/$/, "")}/news/${slug}`;
  // No stored fallback: that asset does not exist. When an article has no
  // hero, the generated site card (app/opengraph-image.tsx) is inherited.
  const image = article.hero_image_url || null;
  const description = article.meta_description || article.excerpt || "TDD article";
  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      url,
      type: "article",
      ...(image
        ? { images: [{ url: image, width: 1200, height: 630, alt: article.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return notFound();

  // Three stories to read next: same topic first, topped up with the latest
  // stories when the topic has fewer than three others.
  let relatedArticles = (await fetchRelatedArticles(article.id, article.topic, 3)).slice(0, 3);

  if (relatedArticles.length < 3) {
    const fallbackArticles = await fetchPublishedArticles(6);
    const fillers = fallbackArticles
      .filter((candidate) =>
        candidate.id !== article.id &&
        !relatedArticles.some((existing) => existing.id === candidate.id)
      )
      .slice(0, 3 - relatedArticles.length);

    relatedArticles = [...relatedArticles, ...fillers];
  }
  const currentArticle = buildHeroArticle(article, slug);

  // Always absolute: the share buttons copy and post this URL, so a relative
  // path (the old behavior when the env var was unset) shared nothing useful.
  const siteUrl = getSiteUrl();
  const shareUrl = `${siteUrl}/news/${slug}`;

  const pieceType = pieceTypeInfo(article.article_type);
  const byOwner = isSiteOwner(article.author_name);
  const note = article.note_text?.trim() ? article.note_text.trim() : null;

  // JSON-LD structured data for this article. The labeled types
  // (OpinionNewsArticle etc.) tell search engines a take from news.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': pieceType?.schemaType ?? 'Article',
    headline: article.title,
    description: article.excerpt || '',
    image: article.hero_image_url ? [article.hero_image_url] : undefined,
    author: !article.author_name
      ? undefined
      : byOwner
        ? { '@type': 'Person', name: SITE_OWNER.name, url: `${siteUrl}${SITE_OWNER.aboutPath}`, sameAs: [SITE_OWNER_X_URL] }
        : { '@type': 'Person', name: article.author_name },
    datePublished: article.published_at || article.created_at,
    dateModified: article.note_at || article.updated_at || undefined,
    url: shareUrl,
    publisher: { '@type': 'Organization', name: 'The Daily Dribble', logo: { '@type': 'ImageObject', url: `${siteUrl}/uploads/articles/dribbles_favicon_1.png` } },
  };
  const family = topicFamily(article.topic);
  const publishedAt = currentArticle.publishedAt;
  // FEATURED is an editorial flag, not a section a reader can browse.
  const topicLink = article.topic && article.topic !== 'FEATURED' && isArticleTopic(article.topic)
    ? article.topic
    : null;

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify(jsonLd)}</script>
      <ViewTracker slug={slug} />
      <ReadProgress />
      <BackToTop />
      {/* View counts are tracked (ViewTracker) but only shown in admin: a
          public count invites comparison, and a small one reads as "nobody
          is here". Likes stay public, on the like button. */}
      <article className="tdd-story" data-family={family}>
        <header className="tdd-story-head">
          <div className="tdd-story-intro">
            <nav className="tdd-story-crumbs" aria-label="Breadcrumb">
              <Link href="/news">News</Link>
              {topicLink && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={`/news?topic=${encodeURIComponent(topicLink)}`} className="tdd-story-topic">
                    {topicLink}
                  </Link>
                </>
              )}
              {pieceType && (
                <Link
                  href={`/standards#${pieceType.value}`}
                  className="tdd-kind"
                  data-kind={pieceType.value}
                  title={`What "${pieceType.label}" means`}
                >
                  {pieceType.label}
                </Link>
              )}
            </nav>
            <h1 className="tdd-story-title" data-length={article.title.length > 70 ? "long" : undefined}>{article.title}</h1>
            {article.excerpt && <p className="tdd-story-dek">{article.excerpt}</p>}
            <p className="tdd-story-byline">
              {article.author_name && (
                <>
                  <span>
                    By{" "}
                    {byOwner
                      ? <Link href={SITE_OWNER.aboutPath} className="tdd-story-author"><strong>{article.author_name}</strong></Link>
                      : <strong>{article.author_name}</strong>}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              {publishedAt && (
                <>
                  <time dateTime={publishedAt}>{longDate(publishedAt)}</time>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{currentArticle.readTime} min read</span>
            </p>
          </div>
          <ArticleHero currentArticle={currentArticle} />
        </header>

        <div className="tdd-story-main">
          <ShareBar url={shareUrl} title={article.title} slug={slug} initialLikes={article.likes || 0} />
          <div className="tdd-story-text">
            {/* Above the story, so nobody reads a rumor as fact or misses
                that a story changed after it went up. */}
            {pieceType?.value === 'rumor' && (
              <aside className="tdd-story-flag" data-kind="rumor" aria-label="Rumor">
                <p className="tdd-story-flag-label">Rumor · Not confirmed</p>
                <p>
                  {article.rumor_source
                    ? <>Reported by {article.rumor_source}. </>
                    : null}
                  <Link href="/standards#rumors">How I handle rumors</Link>
                </p>
              </aside>
            )}
            {note && (
              <aside className="tdd-story-flag" data-kind={article.note_kind === 'correction' ? 'correction' : 'update'} aria-label={noteKindLabel(article.note_kind)}>
                <p className="tdd-story-flag-label">
                  {noteKindLabel(article.note_kind)}
                  {article.note_at && <> · <time dateTime={article.note_at}>{longDate(article.note_at)}</time></>}
                </p>
                <p>{note}</p>
              </aside>
            )}
            {article.body && <ArticleBody content={article.body} />}
            <AuthorCard
              author={{
                name: article.author_name,
                bio: article.author_bio || undefined,
                twitter: article.author_twitter || undefined,
              }}
              href={byOwner ? SITE_OWNER.aboutPath : undefined}
            />
            <NewsletterSignup variant="story" />
          </div>
        </div>
        <RelatedStories articles={relatedArticles} />
      </article>
    </>
  );
}
