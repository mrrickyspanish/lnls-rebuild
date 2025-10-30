import Link from "next/link";
import { TagBadge } from "../primitives/TagBadge";

export type VideoCardProps = {
  youtubeId: string;
  title: string;
  publishedAt?: string | null;
  tags?: { title: string; slug: string }[];
  isShort?: boolean;
};

export const VideoCard = ({ youtubeId, title, publishedAt, tags = [], isShort = false }: VideoCardProps) => {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slateBase/60 bg-charcoal/80 transition hover:border-neonPurple/60">
      <div className="relative aspect-video w-full overflow-hidden bg-slateBase">
        <iframe
          title={title}
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {isShort ? (
          <span className="absolute right-3 top-3 rounded-full bg-neonPurple/80 px-3 py-1 text-xs font-semibold uppercase text-slateBase">
            Short
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <Link href={`https://youtu.be/${youtubeId}`} className="font-semibold text-offWhite hover:text-neonGold">
          {title}
        </Link>
        <p className="text-xs uppercase tracking-wide text-metaGray">
          {publishedAt ? new Date(publishedAt).toLocaleString() : "Unreleased"}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag.slug} label={tag.title} variant="outline" />
          ))}
        </div>
      </div>
    </article>
  );
};
