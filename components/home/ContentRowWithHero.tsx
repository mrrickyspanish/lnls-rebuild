"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, BookOpen, Mic2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  detectTopic,
  AccentColors,
  getCategoryBadge,
} from "@/lib/theme/tokens";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import { canUseNextImage } from "@/lib/images";

type ContentRowWithHeroProps = {
  title: string;
  items: any[];
  viewAllHref?: string;
  autoRotate?: boolean;
  rotateInterval?: number; // seconds
};

function formatDate(dateString: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
}

type CarouselCardProps = {
  item: any;
  index: number;
  episodeQueue?: any[];
  direction: number;
  isMobile: boolean;
};

function CarouselCard({
  item,
  index,
  episodeQueue = [],
  direction,
  isMobile,
}: CarouselCardProps) {
  const topicRaw = item.topic || detectTopic(item);
  const topic = (typeof topicRaw === "string"
    ? topicRaw.toLowerCase()
    : "general") as keyof typeof AccentColors;
  const accent = AccentColors[topic] || AccentColors["general"];
  const badge = getCategoryBadge(
    topic as import("@/lib/theme/tokens").TopicType
  );
  const href = item.source_url || "#";
  const isPodcast = item.content_type === "podcast";
  const isVideo = item.content_type === "video";
  const [isHovered, setIsHovered] = useState(false);
  const { playEpisode, currentEpisode, isPlaying } = useAudioPlayer();
  const useOptimizedImage = canUseNextImage(item.image_url);

  const isCurrentlyPlaying = currentEpisode?.id === item.id && isPlaying;

  const handlePodcastClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPodcast && (item.audio_url || item.source_url)) {
      const podcastEpisodes = episodeQueue
        .filter((ep) => ep.content_type === "podcast")
        .map((ep) => ({
          id: ep.id,
          title: ep.title,
          audio_url: ep.audio_url || ep.source_url,
          image_url: ep.image_url || undefined,
          episode_number: ep.episode_number,
        }));

      playEpisode(
        {
          id: item.id,
          title: item.title,
          audio_url: item.audio_url || item.source_url,
          image_url: item.image_url || undefined,
          episode_number: item.episode_number,
        },
        podcastEpisodes
      );
    }
  };

  const heroWidth = isMobile ? "95vw" : "min(90vw, 1100px)";
  const heroHeightClass = isMobile ? "h-[320px]" : "h-[550px]";

  const cardContent = (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer h-full"
    >
      <div className="p-1">
        {isMobile ? (
          <div className="mt-16">
            <div className={`relative ${heroHeightClass} rounded-lg bg-[var(--netflix-bg)] shadow-2xl ring-2 ring-white/80 overflow-hidden`}>
              {/* Image only in card for mobile, with category tag overlay */}
              <div className="relative w-full h-full min-h-[120px]">
                {item.image_url ? (
                  useOptimizedImage ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500 rounded-lg"
                      priority
                    />
                  ) : (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 rounded-lg"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-lg">
                    <span className="text-white/10 text-7xl">{badge.icon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent rounded-lg" />
                {/* Category badge overlayed in image */}
                <motion.div
                  animate={{ opacity: isHovered ? 0 : 1 }}
                  className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-lg"
                  style={{
                    backgroundColor: `${accent.primary}40`,
                    color: accent.primary,
                    border: `1.5px solid ${accent.primary}`,
                  }}
                >
                  {badge.label}
                </motion.div>
              </div>
            </div>
            {/* Content below card */}
            <div className="w-full flex flex-col justify-center items-center px-4 py-3">
              <h3 className="font-extrabold text-white leading-tight font-netflix line-clamp-2 text-2xl mb-2 tracking-tight text-center drop-shadow-lg">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-white/80 mb-1 justify-center">
                {item.episode_number && (
                  <span className="font-semibold text-white">Ep {item.episode_number}</span>
                )}
                {item.duration && item.episode_number && <span>•</span>}
                {item.duration && (
                  <span>{isPodcast ? `${Math.floor(parseInt(item.duration) / 60)}m` : item.duration}</span>
                )}
                {/* Show author instead of date */}
                {item.author && <span>•</span>}
                {item.author && (
                  <span className="font-semibold text-white">{item.author}</span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-white/90 line-clamp-2 leading-relaxed mb-2 text-center">
                  {item.description.split('. ')[0] + (item.description.includes('.') ? '.' : '')}
                </p>
              )}
              {/* Play button and duration badge */}
              <div className="flex gap-2 items-center justify-center">
                <AnimatePresence>
                  {(isHovered || isCurrentlyPlaying) && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-full backdrop-blur-sm flex items-center justify-center shadow-2xl ring-2 w-10 h-10"
                      style={{
                        background: isCurrentlyPlaying ? 'var(--netflix-red)' : 'white',
                        color: isCurrentlyPlaying ? 'white' : 'black',
                      }}
                    >
                      {isPodcast ? (
                        <Mic2 className="w-5 h-5" />
                      ) : isVideo ? (
                        <Play className="fill-current ml-1 w-5 h-5" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {item.duration && !isCurrentlyPlaying && (
                  <div className="bg-black/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white shadow-lg">
                    {isPodcast ? `${Math.floor(parseInt(item.duration) / 60)}m` : item.duration}
                  </div>
                )}
                {isCurrentlyPlaying && (
                  <div className="flex items-center gap-1 bg-[var(--netflix-red)] px-2 py-1 rounded-full">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs font-bold text-white">Playing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // ...existing code for desktop card layout...
          <div className={`relative ${heroHeightClass} rounded-lg bg-[var(--netflix-bg)] shadow-2xl ring-2 ring-white/80`}>
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              {item.image_url ? (
                useOptimizedImage ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                ) : (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-white/10 text-9xl">{badge.icon}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <motion.div
                animate={{ opacity: isHovered ? 0 : 1 }}
                className="px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-md shadow-lg"
                style={{
                  backgroundColor: `${accent.primary}40`,
                  color: accent.primary,
                  border: `1.5px solid ${accent.primary}`,
                }}
              >
                {badge.label}
              </motion.div>
            </div>
            {/* Play button */}
            <AnimatePresence>
              {(isHovered || isCurrentlyPlaying) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    className={`rounded-full backdrop-blur-sm flex items-center justify-center shadow-2xl ring-2 w-16 h-16 ${
                      isCurrentlyPlaying
                        ? "bg-[var(--netflix-red)] ring-[var(--netflix-red)]/50 animate-pulse"
                        : "bg-white/95 ring-white/50"
                    }`}
                  >
                    {isPodcast ? (
                      <Mic2
                        className={`w-8 h-8 ${
                          isCurrentlyPlaying ? "text-white" : "text-black"
                        }`}
                      />
                    ) : isVideo ? (
                      <Play
                        className={`fill-current ml-1 w-8 h-8 ${
                          isCurrentlyPlaying ? "text-white" : "text-black"
                        }`}
                      />
                    ) : (
                      <BookOpen
                        className={`w-8 h-8 ${
                          isCurrentlyPlaying ? "text-white" : "text-black"
                        }`}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Duration badge */}
            {item.duration && !isCurrentlyPlaying && (
              <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded text-sm font-bold text-white shadow-lg">
                {isPodcast
                  ? `${Math.floor(parseInt(item.duration) / 60)}m`
                  : item.duration}
              </div>
            )}
            {/* Now playing badge */}
            {isCurrentlyPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-[var(--netflix-red)] px-3 py-1.5 rounded-full">
                <div className="flex gap-0.5">
                  <div
                    className="w-0.5 h-3 bg-white animate-pulse"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-0.5 h-3 bg-white animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-0.5 h-3 bg-white animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs font-bold text-white">Playing</span>
              </div>
            )}
            {/* Metadata */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/80">
                {item.episode_number && (
                  <span className="font-semibold text-white">
                    Episode {item.episode_number}
                  </span>
                )}
                {item.duration && item.episode_number && <span>•</span>}
                {item.duration && (
                  <span>
                    {isPodcast
                      ? `${Math.floor(parseInt(item.duration) / 60)}m`
                      : item.duration}
                  </span>
                )}
                {item.published_at && <span>•</span>}
                {item.published_at && (
                  <span>{formatDate(item.published_at)}</span>
                )}
              </div>
              <h3 className="font-bold text-white leading-tight font-netflix line-clamp-2 text-xl md:text-2xl">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      key={item.id ?? index}
      layout
      initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
      transition={{
        layout: {
          duration: 0.7,
          ease: [0.23, 1, 0.32, 1],
        },
        opacity: {
          duration: 0.4,
          ease: "easeOut",
        },
        x: {
          duration: 0.7,
          ease: [0.23, 1, 0.32, 1],
        },
        scale: {
          duration: 0.7,
          ease: [0.23, 1, 0.32, 1],
        },
      }}
      className="flex-shrink-0 snap-start flex items-center justify-center"
      style={{
        width: heroWidth,
        flex: "0 0 auto",
      }}
    >
      {isPodcast && (item.audio_url || item.source_url) ? (
        <div onClick={handlePodcastClick} className="cursor-pointer w-full">
          {cardContent}
        </div>
      ) : (
        <Link
          href={href}
          target={href.startsWith("http") ? "_blank" : "_self"}
          className="w-full"
        >
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
}

export default function ContentRowWithHero({
  title,
  items,
  viewAllHref,
  autoRotate = true,
  rotateInterval = 12,
}: ContentRowWithHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === "undefined" ? 1920 : window.innerWidth
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileLayout = viewportWidth < 768;
  const totalItems = items.length;

  useEffect(() => {
    if (!autoRotate || totalItems <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, rotateInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, totalItems]);

  const nextSlide = () => {
    if (totalItems <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const prevSlide = () => {
    if (totalItems <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <section className="mb-20">
      {/* Row header */}
      {!isMobileLayout && (
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--netflix-text)] font-netflix tracking-tight">
            {title}
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-[var(--netflix-muted)] hover:text-white transition-colors group"
            >
              <span className="text-sm font-medium">View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* Carousel container */}
      <div className="relative group">
        {/* Arrows removed as requested */}

        {/* Single hero card */}
        <div className="w-full flex items-center justify-center" style={{ minHeight: 500 }}>
          <AnimatePresence mode="wait" initial={false}>
            <CarouselCard
              key={currentItem?.id ?? currentIndex}
              item={currentItem}
              index={currentIndex}
              episodeQueue={items}
              direction={direction}
              isMobile={isMobileLayout}
            />
          </AnimatePresence>
        </div>

        {/* Indicators */}
        {totalItems > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {items.slice(0, Math.min(totalItems, 10)).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index === currentIndex) return;
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className="group"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 group-hover:bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
