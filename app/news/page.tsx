// app/news/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getClient, queries } from "@/lib/sanity/client";

export const metadata: Metadata = {
  title: "News",
  description: "Latest Lakers and NBA headlines from LNLS.",
};

export const revalidate = 60;

type Article = {
  _id: string;
  title: string;
  dek?: string;
  slug?: { current?: string };
  _createdAt?: string;
};

async function getNews(): Promise<Article[]> {
  const sanity = getClient();
  // Use the existing query key you have available
  const items: unknown = await sanity.fetch(queries.articles);
  return Array.isArray(items) ? (items as Article[]) : [];
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="section-container py-12">
      <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-8">News</h1>

      {news.length === 0 ? (
        <p className="text-slate-muted">No news yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => {
            const slug = n.slug?.current ?? "";
            const href = slug ? `/news/${slug}` : "#";
            return (
              <article key={n._id} className="card">
                <Link href={href} className="block">
                  <h2 className="text-2xl font-bebas">{n.title}</h2>
                  {n.dek && <p className="text-slate-muted mt-2">{n.dek}</p>}
                </Link>
                <div className="text-xs text-slate-muted mt-3">
                  {n._createdAt ? new Date(n._createdAt).toLocaleDateString() : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
