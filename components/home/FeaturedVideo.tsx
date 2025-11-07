"use client";

import Image from "next/image";
import Link from "next/link";

type Item = {
  id: number | string;
  title: string;
  source_url: string | null;
  image_url?: string | null;
  published_at?: string | null;
};

function formatDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function FeaturedVideo({ item }: { item: Item | null }) {
  if (!item) return null;

  const href = item.source_url ?? "#";
  const img = item.image_url ?? null;

  return (
    <section className="mb-8">
      <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/30">
        <Link href={href} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative w-full aspect-video bg-white/5">
            {img ? (
              <Image src={img} alt={item.title} fill className="object-cover" priority sizes="100vw" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-white/50">No thumbnail</div>
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/70 to-transparent">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs">
                <span>Video</span>
                {item.published_at && <span className="text-white/60">{formatDate(item.published_at)}</span>}
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-semibold leading-snug">{item.title}</h2>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
