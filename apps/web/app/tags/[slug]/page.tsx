import type { Metadata } from "next";
import { ArticleCard, SkeletonList } from "@lnls/ui";
import { buildMetadata } from "../../../src/utils/metadata";
import { fetchArticles } from "../../../src/lib/sanity/fetchers";

export const generateMetadata = async ({ params }: { params: { slug: string } }): Promise<Metadata> =>
  buildMetadata({
    title: `${params.slug.replace(/-/g, " ")} | LNLS`,
    description: "Browse Late Night Lake Show stories by tag."
  });

export default async function TagArchive({ params }: { params: { slug: string } }) {
  const articles = await fetchArticles();
  const filtered = articles.filter((article) =>
    (article.tags as any[])?.some((tag) => tag.slug === params.slug || tag.slug?.current === params.slug)
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-5xl text-offWhite">#{params.slug}</h1>
        <p className="text-offWhite/70">All stories related to {params.slug.replace(/-/g, " ")}.</p>
      </header>
      {filtered.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              slug={article.slug}
              title={article.title}
              dek={article.dek}
              publishAt={article.publishAt}
            />
          ))}
        </div>
      ) : (
        <SkeletonList count={4} />
      )}
    </div>
  );
}
