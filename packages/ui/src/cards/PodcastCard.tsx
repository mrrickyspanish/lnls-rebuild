import Link from "next/link";
import { ShareButtons } from "../primitives/ShareButtons";

export type PodcastCardProps = {
  slug: string;
  title: string;
  audioUrl?: string | null;
  duration?: string | null;
  publishedAt?: string | null;
  showNotes?: string | null;
};

export const PodcastCard = ({ slug, title, audioUrl, duration, publishedAt, showNotes }: PodcastCardProps) => {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slateBase/60 bg-charcoal/80 p-6">
      <div className="flex flex-col gap-2">
        <Link href={`/podcast/${slug}`} className="font-headline text-2xl text-offWhite hover:text-neonPurple">
          {title}
        </Link>
        <p className="text-xs uppercase tracking-wide text-metaGray">
          {publishedAt ? new Date(publishedAt).toLocaleString() : "Unscheduled"}
        </p>
        {duration ? <p className="text-xs text-offWhite/70">Duration: {duration}</p> : null}
        {showNotes ? <span className="rounded-full bg-neonGold/20 px-3 py-1 text-xs font-semibold text-neonGold">AI Show Notes</span> : null}
      </div>
      {audioUrl ? (
        <audio controls preload="none" className="w-full">
          <source src={audioUrl} />
        </audio>
      ) : null}
      <ShareButtons
        url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://latenightlakeshow.com"}/podcast/${slug}`}
        title={title}
      />
    </article>
  );
};
