// app/news/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleHero from "@/components/article/ArticleHero";
import ArticleBody from "@/components/article/ArticleBody";
import RelatedRow from "@/components/article/RelatedRow";
import AuthorCard from "@/components/article/AuthorCard";
import ShareBar from "@/components/article/ShareBar";
import ReadProgress from "@/components/article/ReadProgress";
import { fetchArticleBySlug, fetchRelatedArticles, fetchPublishedArticles } from "@/lib/supabase/articles";
import type { Article } from "@/types/supabase";

export const revalidate = 60;

type RouteParams = { slug: string };
type PageProps = { params: Promise<RouteParams> };

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=675&fit=crop";

function buildHeroArticle(article: Article, slug: string) {
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

function toHeroCard(article: Article | undefined) {
  if (!article) return null;
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || "",
    heroImage: article.hero_image_url || FALLBACK_IMAGE,
    imageCredit: article.image_credit,
    author: { name: article.author_name },
    publishedAt: article.published_at || article.created_at,
    readTime: article.read_time || 4,
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
  const [nextArticle, previewArticle, ...remainingRelated] = relatedArticles;

  const currentArticle = buildHeroArticle(article, slug);
  const relatedRowItems = mapRelatedRow(remainingRelated);

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

      <article>
        <ArticleHero
          currentArticle={currentArticle}
          nextArticle={toHeroCard(nextArticle)}
          previewArticle={toHeroCard(previewArticle)}
        />

        {article.body && <ArticleBody content={article.body} />}

        <AuthorCard
          author={{
            name: article.author_name,
            bio: article.author_bio || undefined,
            twitter: article.author_twitter || undefined,
          }}
        />

        <RelatedRow
          articles={relatedRowItems}
          title="More Lakers News"
        />
      </article>
    </>
  );
}
