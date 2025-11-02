"use client";
import { formatDateUTC } from '@/utils/date';
import Image from "next/image";

type NewsItem = {
  id?: string;
  title: string;
  summary?: string | null;
  source: string;
  source_url: string;
  image_url?: string | null;
  published_at: string;
};

export default function NewsStream({ items = [] as NewsItem[] }) {
  if (!items.length) return null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-6">Latest Stories</h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li
            key={it.source_url}
            className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition"
          >
            {it.image_url && (
              <div className="relative w-full h-48">
                <Image
                  src={it.image_url}
                  alt={it.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
            )}
            <div className="p-4 flex flex-col justify-between h-full">
              <a
                href={it.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:underline line-clamp-2"
              >
                {it.title}
              </a>
              {it.summary && (
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                  {it.summary}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full ${
                    it.source === "YouTube"
                      ? "bg-red-600/20 text-red-400"
                      : it.source.includes("ESPN")
                      ? "bg-orange-600/20 text-orange-400"
                      : "bg-blue-600/20 text-blue-400"
                  }`}
                >
                  {it.source}
                </span>
                <time dateTime={it.published_at}>{formatDateUTC(it.published_at)}</time>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
