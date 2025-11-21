// app/news/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { fetchPublishedArticles } from "@/lib/supabase/articles";

export const metadata: Metadata = {
  title: "News",
  description: "Latest Lakers and NBA headlines from LNLS.",
};

export const revalidate = 60;

function formatDate(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function NewsPage() {
  const news = await fetchPublishedArticles(30);

  return (
    <div className="section-container py-12">
      <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-8">News</h1>

      {news.length === 0 ? (
        <p className="text-slate-muted">No news yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => {
            const href = `/news/${n.slug}`;
            return (
              <article key={n.id} className="card">
                <Link href={href} className="block">
                  <h2 className="text-2xl font-bebas">{n.title}</h2>
                  {n.excerpt && <p className="text-slate-muted mt-2">{n.excerpt}</p>}
                </Link>
                <div className="text-xs text-slate-muted mt-3">
                  {formatDate(n.published_at || n.created_at)}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
