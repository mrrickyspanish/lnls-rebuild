// app/news/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleHero from "@/components/article/ArticleHero";
import ArticleBody from "@/components/article/ArticleBody";
import RelatedRow from "@/components/article/RelatedRow";
import AuthorCard from "@/components/article/AuthorCard";
import ShareBar from "@/components/article/ShareBar";
import ReadProgress from "@/components/article/ReadProgress";
import { fetchArticleBySlug, fetchRelatedArticles, fetchPublishedArticles } from "@/lib/supabase/articles";
import type { Article } from "@/types/supabase";

type ArticleSlide = {
  image_url: string;
  caption: string;
  description?: string;
};

type ArticleWithSlideshow = Article & {
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
    imageCredit: article.image_credit,
    author: { name: article.author_name },
    publishedAt: article.published_at || article.created_at,
    readTime: article.read_time || 5,
    topic: article.topic || "Lakers",
  };
}

function mapRelatedRow(articles: Article[]) {
  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    image_url: article.hero_image_url,
    content_type: "article",
    source: "TDD",
    source_url: `/news/${article.slug}`,
    published_at: article.published_at || article.created_at,
    excerpt: article.excerpt,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.excerpt || "TDD article",
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return notFound();

  let relatedArticles = await fetchRelatedArticles(article.id, article.topic, 6);

  if (relatedArticles.length < 2) {
    const fallbackArticles = await fetchPublishedArticles(6, article.topic);
    const fillers = fallbackArticles
      .filter((candidate) =>
        candidate.id !== article.id &&
        !relatedArticles.some((existing) => existing.id === candidate.id)
      )
      .slice(0, 2 - relatedArticles.length);

    relatedArticles = [...relatedArticles, ...fillers];
  }
  const currentArticle = buildHeroArticle(article, slug);
  const relatedRowItems = mapRelatedRow(relatedArticles);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";
  const shareUrl = siteUrl
    ? `${siteUrl.replace(/\/$/, "")}/news/${slug}`
    : `/news/${slug}`;

  return (
    <>
      <ReadProgress />
      <ShareBar url={shareUrl} title={article.title} />
      <article className="px-4 md:px-8 lg:px-24 xl:px-48">
        {/* Breadcrumbs */}
        <nav className="article-breadcrumbs mb-2" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="article-breadcrumbs__separator">/</span>
          <Link href="/news">News</Link>
          <span className="article-breadcrumbs__separator">/</span>
          <span className="article-breadcrumbs__current" aria-current="page">
            {article.title}
          </span>
        </nav>
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold mb-2 mt-2 leading-tight">{article.title}</h1>
        {/* Author, Date, Read Time */}
        <div className="mb-4 text-base text-gray-600 flex flex-wrap gap-2 items-center">
          <span>By {article.author_name}</span>
          <span>•</span>
          <span>{currentArticle.publishedAt ? new Date(currentArticle.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
          <span>•</span>
          <span>{currentArticle.readTime} min read</span>
        </div>
        {/* Image (with credit handled in ArticleHero) */}
        <ArticleHero currentArticle={currentArticle} />
        {/* Article Body */}
        {article.body && (
          <ArticleBody content={article.body} />
        )}
        <RelatedRow
          articles={relatedRowItems}
          title="Keep Digging"
        />
      </article>
    </>
  );
}
