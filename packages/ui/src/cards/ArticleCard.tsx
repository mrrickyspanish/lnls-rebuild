import Link from "next/link";
import { TagBadge } from "../primitives/TagBadge";

export type ArticleCardProps = {
  slug: string;
  title: string;
  dek?: string;
  publishAt?: string | null;
  tags?: { title: string; slug: string }[];
};

export const ArticleCard = ({ slug, title, dek, publishAt, tags = [] }: ArticleCardProps) => {
  return (
    <article className="group rounded-2xl border border-slateBase/60 bg-charcoal/80 p-6 transition hover:border-neonPurple/60 hover:shadow-lg hover:shadow-neonPurple/20">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-wide text-metaGray">
          {publishAt ? new Date(publishAt).toLocaleDateString() : "Coming soon"}
        </p>
        <Link href={`/articles/${slug}`} className="font-headline text-3xl text-offWhite group-hover:text-neonGold">
          {title}
        </Link>
        {dek ? <p className="text-sm text-offWhite/80">{dek}</p> : null}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag.slug} label={tag.title} />
          ))}
        </div>
      </div>
    </article>
  );
};
