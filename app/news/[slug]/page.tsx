// app/news/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClient, queries } from "@/lib/sanity/client";
import Link from "next/link";

type Article = {
  _id: string;
  title: string;
  dek?: string;
  slug?: { current?: string };
  _createdAt?: string;
  body?: unknown; // render later with PortableText, if you have it
};

export const revalidate = 60;

type Params = { params: { slug: string } };

async function getArticle(slug: string): Promise<Article | null> {
  const sanity = getClient();
  // Use your existing query key; you listed `articleBySlug` in queries
  const doc = await sanity.fetch(queries.articleBySlug(slug));
  return doc ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.dek || "LNLS article",
  };
}

export default async function ArticlePage({ params }: Params) {
  const article = await getArticle(params.slug);
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

      {/* TODO: render body with @portabletext/react if you have rich content */}
      {/* <PortableText value={article.body} components={portableComponents} /> */}
    </div>
  );
}
