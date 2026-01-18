"use client";

import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ContentTile from "./ContentTile";
import ContentTileSkeleton from "./ContentTileSkeleton";
import { useRef, useState } from "react";

type ContentRowProps = {
  title: string;
  description?: string;
  items: any[];
  viewAllHref?: string;
  cardSize?: 'default' | 'small';
  isLoading?: boolean;
};

export default function ContentRow({ title, description, items, viewAllHref, cardSize = 'default', isLoading = false }: ContentRowProps) {
  const displayItems = items.slice(0, 6);
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistance = useRef(0);

  const widthClass = cardSize === 'small' ? 'w-[250px]' : 'w-[300px]';

  // Show skeleton loader count
  const skeletonCount = 6;

  const handleClick = (direction: "left" | "right") => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!rowRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - rowRef.current.offsetLeft);
    setScrollLeft(rowRef.current.scrollLeft);
    dragDistance.current = 0;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    rowRef.current.scrollLeft = scrollLeft - walk;
    dragDistance.current = Math.abs(walk);
    if (!isMoved) setIsMoved(true);
  };

  const handleCaptureClick = (e: React.MouseEvent) => {
    if (dragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="mb-20 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--netflix-text)] font-netflix tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-white/40 mt-1">{description}</p>
          )}
        </div>
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
      <div className="relative group">
        {/* Left Arrow */}
        <button
          className={`absolute top-0 bottom-0 left-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
            !isMoved ? "hidden" : ""
          }`}
          onClick={() => handleClick("left")}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div
          ref={rowRef}
          className={`flex gap-3 overflow-x-auto pb-4 px-4 md:px-0 scrollbar-hide snap-x snap-mandatory scroll-smooth ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClickCapture={handleCaptureClick}
        >
          {isLoading ? (
            // Show skeleton loaders
            Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className={`flex-shrink-0 ${widthClass} snap-start`}
              >
                <ContentTileSkeleton size={cardSize} />
              </div>
            ))
          ) : (
            // Show actual content
            displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`flex-shrink-0 ${widthClass} snap-start pointer-events-none`}
              >
                <div className="pointer-events-auto">
                  <ContentTile {...item} episodeQueue={items} size={cardSize} />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Right Arrow */}
        <button
          className="absolute top-0 bottom-0 right-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
          onClick={() => handleClick("right")}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>

        {/* Scroll Fade Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}