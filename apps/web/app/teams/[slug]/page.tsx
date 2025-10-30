import type { Metadata } from "next";
import { ArticleCard, SkeletonList, TeamChip } from "@lnls/ui";
import { buildMetadata } from "../../../src/utils/metadata";
import { fetchArticles } from "../../../src/lib/sanity/fetchers";

export const generateMetadata = async ({ params }: { params: { slug: string } }): Promise<Metadata> =>
  buildMetadata({
    title: `${params.slug.toUpperCase()} Coverage | LNLS`,
    description: "Team-specific coverage curated by Late Night Lake Show."
  });

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const articles = await fetchArticles();
  const filtered = articles.filter((article) =>
    (article.teams as any[])?.some((team) => team.slug === params.slug || team.slug?.current === params.slug)
  );

  return (
    <div className="space-y-6">
      <TeamChip name={params.slug.replace(/-/g, " ")} />
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
