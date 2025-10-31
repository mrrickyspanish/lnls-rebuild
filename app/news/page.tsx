// app/news/page.tsx
import type { Metadata } from "next";
import { getClient, queries } from "@/lib/sanity/client";

export const metadata: Metadata = {
  title: "News",
  description: "Latest Lakers and NBA headlines from LNLS.",
};

export const revalidate = 60;

async function getNews() {
  const sanity = getClient();
  // If your query key is different, swap to queries.articles or queries.newsList
  const items = await sanity.fetch(queries.news);
  return Array.isArray(items) ? items : [];
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
          {news.map((n: any) => (
            <article key={n._id} className="card">
              <a href={`/news/${n.slug?.current ?? ""}`} className="block">
                <h2 className="text-2xl font-bebas">{n.title}</h2>
                {n.dek && <p className="text-slate-muted mt-2">{n.dek}</p>}
              </a>
              <div className="text-xs text-slate-muted mt-3">
                {n._createdAt ? new Date(n._createdAt).toLocaleDateString() : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
