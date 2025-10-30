import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose, ShareButtons, TagBadge } from "@lnls/ui";
import { PortableText } from "@portabletext/react";
import { buildMetadata } from "../../../src/utils/metadata";
import { articleJsonLd } from "../../../src/utils/jsonld";
import { fetchArticleDetail } from "../../../src/lib/sanity/fetchers";

export const generateMetadata = async ({ params }: { params: { slug: string } }): Promise<Metadata> => {
  const article = await fetchArticleDetail(params.slug);
  if (!article) {
    return buildMetadata({
      title: "Article not found | Late Night Lake Show",
      description: "The story you are looking for has moved."
    });
  }

  return buildMetadata({
    title: `${article.title} | Late Night Lake Show`,
    description: article.dek ?? "Late Night Lake Show article",
    openGraph: {
      title: article.title,
      description: article.dek ?? "Late Night Lake Show article"
    }
  });
};

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await fetchArticleDetail(params.slug);
  if (!article) {
    notFound();
  }

  return (
    <article className="space-y-10">
      <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify(articleJsonLd({
        title: article.title,
        slug: article.slug.current,
        publishAt: article.publishAt ?? undefined
      }))}</script>
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-metaGray">
          {article.publishAt ? new Date(article.publishAt).toLocaleDateString() : "Draft"}
        </p>
        <h1 className="font-headline text-5xl text-offWhite md:text-6xl">{article.title}</h1>
        {article.dek ? <p className="text-lg text-offWhite/80">{article.dek}</p> : null}
        <div className="flex flex-wrap gap-2">
          {article.tags?.map((tag) => (
            <TagBadge key={tag?._id ?? tag?._ref ?? tag?.slug?.current} label={tag?.name ?? "Tag"} />
          ))}
        </div>
      </header>
      <Prose>
        <PortableText value={(article as any).body ?? []} />
      </Prose>
      <ShareButtons
        url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://latenightlakeshow.com"}/articles/${article.slug.current}`}
        title={article.title}
      />
    </article>
  );
}
