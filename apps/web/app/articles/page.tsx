import type { Metadata } from "next";
import { ArticleCard, SkeletonList } from "@lnls/ui";
import { buildMetadata } from "../../src/utils/metadata";
import { fetchArticles } from "../../src/lib/sanity/fetchers";

export const metadata: Metadata = buildMetadata({
  title: "Articles | Late Night Lake Show",
  description: "Latest Lakers analysis, features, and breakdowns from the LNLS crew."
});

export default async function ArticlesPage() {
  const articles = await fetchArticles();

  if (!articles.length) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-5xl text-offWhite">Articles</h1>
        <p className="text-offWhite/70">No published articles yet. Check back after the next upload.</p>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-headline text-5xl text-offWhite">Articles</h1>
        <p className="text-offWhite/70">
          The best nightly takes on the Lakers. Filter by tags using the Studio or browse the latest below.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            slug={article.slug}
            title={article.title}
            dek={article.dek}
            publishAt={article.publishAt}
            tags={article.tags as any}
          />
        ))}
      </div>
    </div>
  );
}
