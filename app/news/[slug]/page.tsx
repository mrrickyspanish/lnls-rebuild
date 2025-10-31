// app/news/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient, queries } from "@/lib/sanity/client";

export const revalidate = 60;

type RouteParams = { slug: string };
type PageProps = { params: Promise<RouteParams> };

type Article = {
  _id: string;
  title: string;
  dek?: string;
  slug?: { current?: string };
  _createdAt?: string;
  body?: unknown;
};

async function getArticle(slug: string): Promise<Article | null> {
  const sanity = getClient();
  // You listed queries.articleBySlug as a function(slug) — using it here:
  const doc = await sanity.fetch(queries.articleBySlug(slug));
  return doc ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; // <-- await params (Next 15)
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.dek || "LNLS article",
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params; // <-- await params (Next 15)
  const article = await getArticle(slug);
  if (!article) return notFound();

  return (
    <div className="section-container py-12">
      <Link href="/news" className="text-sm text-slate-muted hover:underline">
        ← Back to News
      </Link>

      <h1 className="mt-4 text-5xl lg:text-6xl font-bebas gradient-text">
        {article.title}
      </h1>

      {article.dek && (
        <p className="mt-3 text-lg text-slate-muted max-w-2xl">{article.dek}</p>
      )}

      <div className="mt-2 text-xs text-slate-muted">
        {article._createdAt ? new Date(article._createdAt).toLocaleDateString() : null}
      </div>

      {/* TODO: render rich body with @portabletext/react if needed */}
      {/* <PortableText value={article.body} components={portableComponents} /> */}
    </div>
  );
}
