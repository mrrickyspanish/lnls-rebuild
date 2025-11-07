"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type NewsItem = {
  id: string | number;
  title: string;
  source: string | null;
  source_url: string | null;
  image_url?: string | null;
  published_at?: string | Date | null;
  summary?: string | null;
  latest_take?: {
    id: string;
    headline: string | null;
    body: string;
    tags: string[] | null;
    published_at: string | null;
    writer_id: string | null;
  } | null;
};

function formatDateLabel(d?: string | Date | null) {
  if (!d) return "";
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return ""; }
}

function isYouTubeUrl(url?: string | null) {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes("youtube.com/watch?v=") || u.includes("youtu.be/");
}

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v"); if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    return null;
  } catch { return null; }
}

function googleFavicon(url?: string | null, size = 128) {
  if (!url) return null;
  try { const { hostname } = new URL(url); return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`; }
  catch { return null; }
}

function resolveThumbnail(item: NewsItem): { src: string | null; alt: string } {
  if (item.image_url) return { src: item.image_url, alt: item.title };
  if (isYouTubeUrl(item.source_url)) {
    const id = extractYouTubeId(item.source_url);
    if (id) return { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: item.title };
  }
  const favicon = googleFavicon(item.source_url);
  return { src: favicon, alt: item.title };
}

function useImageSrcWithGuard(src: string | null) {
  const [safeSrc, setSafeSrc] = useState(src ?? null);
  return { src: safeSrc, onError: () => setSafeSrc(null) } as const;
}

function TakeBlock({ take }: { take: NonNullable<NewsItem["latest_take"]> }) {
  return (
    <div className="mt-2 rounded-lg border border-border bg-background/60 p-3">
      <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide">
        <span className="inline-flex items-center rounded-full border px-2 py-0.5">LNLS Take</span>
        {take.tags && take.tags.length > 0 && <span className="text-muted-foreground">{take.tags.join(" · ")}</span>}
      </div>
      {take.headline && <div className="text-sm font-semibold">{take.headline}</div>}
      <p className="text-sm text-muted-foreground">{take.body}</p>
    </div>
  );
}

export default function NewsStream({ items }: { items: NewsItem[] }) {
  const normalized = useMemo(() => (items || []).map((it) => ({ ...it, _dateLabel: formatDateLabel(it.published_at) })), [items]);
  if (!normalized?.length) return <div className="w-full p-6 text-center text-sm text-muted-foreground">Nothing to show yet. Run ingest and refresh.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {normalized.map((item) => {
        const thumb = resolveThumbnail(item);
        const guard = useImageSrcWithGuard(thumb.src);
        const href = item.source_url || "#";
        const source = item.source || "";
        return (
          <article key={item.id} className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow">
            <Link href={href} target="_blank" rel="noopener noreferrer" className="block">
              <div className="relative w-full aspect-[16/9] bg-muted/40">
                {guard.src ? (
                  <Image src={guard.src} alt={thumb.alt} fill className="object-cover"
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                         onError={guard.onError} priority={false} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  {source && <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide bg-background">{source}</span>}
                  {(item as any)._dateLabel && <time className="text-muted-foreground">{(item as any)._dateLabel}</time>}
                </div>
                <h3 className="text-base font-semibold leading-snug group-hover:underline">{item.title}</h3>
                {item.summary && <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>}
                {item.latest_take && <TakeBlock take={item.latest_take} />}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
