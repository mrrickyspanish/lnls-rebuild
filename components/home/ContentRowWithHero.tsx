"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, MouseEvent, KeyboardEvent } from "react";
import {
  detectTopic,
  AccentColors,
  getCategoryBadge,
  TopicType,
} from "@/lib/theme/tokens";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import { canUseNextImage } from "@/lib/images";

type ContentItem = {
  id: string | number;
  title: string;
  image_url?: string | null;
  source_url?: string | null;
  audio_url?: string | null;
  content_type?: string | null;
  duration?: string | null;
  episode_number?: number | null;
  topic?: string | null;
  is_featured?: boolean;
  published_at?: string | null;
  description?: string | null;
  author?: string | null;
  author_name?: string | null;
  show?: string | null;
  channel?: string | null;
};

type ContentRowWithHeroProps = {
  title: string;
  items: ContentItem[];
  viewAllHref?: string;
  autoRotate?: boolean;
  rotateInterval?: number; // seconds
};

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return String(dateString);
  }
}

type CarouselCardProps = {
  item: ContentItem;
  index: number;
  episodeQueue?: ContentItem[];
  direction: number;
  isMobile: boolean;
};

function CarouselCard({
  item,
  episodeQueue = [],
  direction, // kept for future animation use
  isMobile,
}: CarouselCardProps) {
  const topicRaw = item.topic || detectTopic(item as any);
  const topic = (typeof topicRaw === "string"
    ? topicRaw.toLowerCase()
    : "general") as keyof typeof AccentColors;
  const accent = AccentColors[topic] || AccentColors["general"];
  const badge = getCategoryBadge(topic as TopicType);
  const isPodcast = item.content_type === "podcast";
  const isVideo = item.content_type === "video";
  const [isHovered, setIsHovered] = useState(false);
  const { playEpisode, currentEpisode, isPlaying } = useAudioPlayer();
  const useOptimizedImage = canUseNextImage(item.image_url || undefined);

  const isCurrentlyPlaying = currentEpisode?.id === item.id && isPlaying;

  const handlePodcastClick = (e: MouseEvent) => {
    e.preventDefault();
    if (isPodcast && (item.audio_url || item.source_url)) {
      const podcastEpisodes = episodeQueue
        .filter((ep) => ep.content_type === "podcast")
        .map((ep) => ({
          id: String(ep.id),
          title: ep.title,
          audio_url: ep.audio_url || ep.source_url || "",
          image_url: ep.image_url || undefined,
          episode_number: ep.episode_number || undefined,
        }));

        playEpisode(
          {
            id: String(item.id),
            title: item.title,
            audio_url: item.audio_url || item.source_url || "",
            image_url: item.image_url || undefined,
            episode_number: item.episode_number || undefined,
          },
          podcastEpisodes
        );
    }
  };

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
            <div
              className={`relative ${heroHeightClass} bg-[var(--netflix-bg)] shadow-2xl ring-2 ring-white/80 overflow-hidden`}
            >
              <div className="relative w-full h-full min-h-[120px]">
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
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
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
            <div className="w-full flex flex-col justify-center items-center px-4 py-3">
              <h3 className="font-extrabold text-white leading-tight font-netflix line-clamp-2 text-2xl mb-2 tracking-tight text-center drop-shadow-lg">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-white/80 mb-1 justify-center">
                {item.episode_number && (
                  <span className="font-semibold text-white">
                    Ep {item.episode_number}
                  </span>
                )}
                {item.duration && item.episode_number && <span>•</span>}
                {item.duration && (
                  <span>
                    {isPodcast
                      ? `${Math.floor(
                          parseInt(item.duration || "0", 10) / 60
                        )}m`
                      : item.duration}
                  </span>
                )}
                {item.author && <span>•</span>}
                {item.author && (
                  <span className="font-semibold text-white">
                    {item.author}
                  </span>
                )}
              </div>
              {item.description && (
                <>
                  <p className="text-xs text-white/90 line-clamp-2 leading-relaxed mb-1 text-center">
                    {item.description.split(". ")[0] +
                      (item.description.includes(".") ? "." : "")}
                  </p>
                  {(() => {
                    let byline: string | null = null;
                    if (
                      isPodcast &&
                      (item.show || item.author_name || item.author)
                    ) {
                      byline = `from ${
                        item.show || item.author_name || item.author
                      }`;
                    } else if (
                      item.content_type === "youtube" &&
                      (item.channel || item.author_name || item.author)
                    ) {
                      byline = `from ${
                        item.channel || item.author_name || item.author
                      }`;
                    } else if (item.author_name || item.author) {
                      byline = `by ${item.author_name || item.author}`;
                    }
                    return byline ? (
                      <div className="italic text-white/80 text-sm text-center mb-2">
                        {byline}
                      </div>
                    ) : null;
                  })()}
                </>
              )}
              {!item.description && (() => {
                let byline: string | null = null;
                if (
                  isPodcast &&
                  (item.show || item.author_name || item.author)
                ) {
                  byline = `from ${
                    item.show || item.author_name || item.author
                  }`;
                } else if (
                  item.content_type === "youtube" &&
                  (item.channel || item.author_name || item.author)
                ) {
                  byline = `from ${
                    item.channel || item.author_name || item.author
                  }`;
                } else if (item.author_name || item.author) {
                  byline = `by ${item.author_name || item.author}`;
                }
                return byline ? (
                  <div className="italic text-white/80 text-sm text-center mb-2">
                    {byline}
                  </div>
                ) : null;
              })()}
              <div className="flex gap-2 items-center justify-center">
                {item.duration && !isCurrentlyPlaying && (
                  <div className="bg-black/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white shadow-lg">
                    {isPodcast
                      ? `${Math.floor(
                          parseInt(item.duration || "0", 10) / 60
                        )}m`
                      : item.duration}
                  </div>
                )}
                {isCurrentlyPlaying && (
                  <div className="flex items-center gap-1 bg-[var(--netflix-red)] px-2 py-1 rounded-full">
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
                    <span className="text-xs font-bold text-white">
                      Playing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`relative ${heroHeightClass} rounded-lg bg-[var(--netflix-bg)] shadow-2xl ring-2 ring-white/80`}
          >
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
                  <span className="text-white/10 text-9xl">
                    {badge.icon}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

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

            {/* Removed on-hover white circle button overlay */}

            {item.duration && !isCurrentlyPlaying && (
              <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded text-sm font-bold text-white shadow-lg">
                {isPodcast
                  ? `${Math.floor(
                      parseInt(item.duration || "0", 10) / 60
                    )}m`
                  : item.duration}
              </div>
            )}

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
                      ? `${Math.floor(
                          parseInt(item.duration || "0", 10) / 60
                        )}m`
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

  // Restore previous wrapping logic for desktop (non-mobile)
  if (isMobile) {
    return cardContent;
  }
  // For desktop: wrap in Link or clickable div
  const href = item.source_url || "#";
  if (isPodcast && (item.audio_url || item.source_url)) {
    return (
      <motion.div
        key={String(item.id)}
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
          width: "min(90vw, 1100px)",
          flex: "0 0 auto",
        }}
      >
        <div onClick={handlePodcastClick} className="cursor-pointer w-full">
          {cardContent}
        </div>
      </motion.div>
    );
  } else {
    return (
      <motion.div
        key={String(item.id)}
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
          width: "min(90vw, 1100px)",
          flex: "0 0 auto",
        }}
      >
        <Link
          href={href}
          target={href.startsWith("http") ? "_blank" : "_self"}
          className="w-full"
        >
          {cardContent}
        </Link>
      </motion.div>
    );
  }
}

export default function ContentRowWithHero({
  title,
  items,
  viewAllHref,
  autoRotate = true,
  rotateInterval = 12,
}: ContentRowWithHeroProps) {
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
  if (!items || items.length === 0) return null;

  const featuredIdx = items.findIndex((item) => item.is_featured);
  const heroItem = featuredIdx > -1 ? items[featuredIdx] : items[0];

  let mobileList: ContentItem[] = [];
  if (isMobileLayout) {
    const list = items.filter((item) => item !== heroItem);
    const podcastIdx = list.findIndex(
      (item) => item.content_type === "podcast"
    );
    if (podcastIdx > -1) {
      mobileList = [
        list[podcastIdx],
        ...list.filter((_, i) => i !== podcastIdx),
      ];
    } else {
      mobileList = list;
    }
  }

  const { playEpisode } = useAudioPlayer();

  const handleMobileItemClick = (item: ContentItem, list: ContentItem[]) => {
    const isPodcast =
      item.content_type === "podcast" && (item.audio_url || item.source_url);
    if (isPodcast) {
      const podcastEpisodes = list
        .filter((ep) => ep.content_type === "podcast")
        .map((ep) => ({
          id: String(ep.id),
          title: ep.title,
          audio_url: ep.audio_url || ep.source_url || "",
          image_url: ep.image_url || undefined,
          episode_number: ep.episode_number || undefined,
        }));
      playEpisode(
        {
          id: String(item.id),
          title: item.title,
          audio_url: item.audio_url || item.source_url || "",
          image_url: item.image_url || undefined,
          episode_number: item.episode_number || undefined,
        },
        podcastEpisodes
      );
    } else if (item.source_url) {
      window.open(
        item.source_url,
        item.source_url.startsWith("http") ? "_blank" : "_self"
      );
    }
  };

  return (
    <section className="mb-20">
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

      <div className="relative group">
        <div
          className="w-full flex items-center justify-center"
          style={{ minHeight: 500 }}
        >
          <CarouselCard
            key={String(heroItem?.id)}
            item={heroItem}
            index={0}
            episodeQueue={items}
            direction={1}
            isMobile={isMobileLayout}
          />
        </div>

        {isMobileLayout && mobileList.length > 0 && (
          <div className="mt-4 px-2 flex flex-col gap-2">
            {mobileList.map((item) => {
              const clickHandler = (e: MouseEvent | KeyboardEvent) => {
                e.preventDefault();
                handleMobileItemClick(item, mobileList);
              };
              return (
                <div
                  key={String(item.id)}
                  className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 border border-white/10 cursor-pointer hover:bg-white/10 transition"
                  tabIndex={0}
                  role="button"
                  onClick={clickHandler as any}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      clickHandler(e);
                    }
                  }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-800 rounded-md flex items-center justify-center text-2xl text-white/30">
                      ?
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-white/80 mb-0.5">
                      {item.episode_number && (
                        <span className="font-semibold text-white">
                          Ep {item.episode_number}
                        </span>
                      )}
                      {item.duration && item.episode_number && <span>•</span>}
                      {item.duration && (
                        <span>
                          {item.content_type === "podcast"
                            ? `${Math.floor(
                                parseInt(item.duration || "0", 10) / 60
                              )}m`
                            : item.duration}
                        </span>
                      )}
                      {item.author && <span>•</span>}
                      {item.author && (
                        <span className="font-semibold text-white">
                          {item.author}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-white truncate text-base leading-tight">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-xs text-white/70 truncate">
                        {item.description.split(". ")[0] +
                          (item.description.includes(".") ? "." : "")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
