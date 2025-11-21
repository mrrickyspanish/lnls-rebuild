"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ContentTile from "./ContentTile";

type ContentRowProps = {
  title: string;
  items: any[];
  viewAllHref?: string;
};

export default function ContentRow({ title, items, viewAllHref }: ContentRowProps) {
  const displayItems = items.slice(0, 6);

  return (
    <section className="mb-20">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--netflix-text)] font-netflix tracking-tight">
          {title}
        </h2>
        {viewAllHref && items.length > 6 && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-[var(--netflix-muted)] hover:text-white transition-colors group"
          >
            <span className="text-sm font-medium">View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 md:px-0 scrollbar-hide snap-x snap-mandatory">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0 w-[300px] snap-start"
            >
              <ContentTile {...item} episodeQueue={items} />
            </motion.div>
          ))}
        </div>

        {/* Scroll Fade Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}