"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, BookOpen, Mic2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { detectTopic, AccentColors, getCategoryBadge } from "@/lib/theme/tokens";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import { canUseNextImage } from "@/lib/images";

type ContentRowWithHeroProps = {
  title: string;
  items: any[];
  viewAllHref?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
};

type VisibleItem = {
  item: any;
  position: 'hero' | 'card';
  key: string;
  index: number;
};

function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Use UTC to ensure server/client consistency
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

type CarouselCardProps = {
  item: any;
  position: 'hero' | 'card';
  index: number;
  episodeQueue?: any[];
  direction: number;
  isMobile: boolean;
};

function CarouselCard({ item, position, index, episodeQueue = [], direction, isMobile }: CarouselCardProps) {
  const topic = detectTopic(item);
  const accent = AccentColors[topic];
  const badge = getCategoryBadge(topic);
  const href = item.source_url || "#";
  const isPodcast = item.content_type === "podcast";
  const isVideo = item.content_type === "video";
  const [isHovered, setIsHovered] = useState(false);
  const { playEpisode, currentEpisode, isPlaying } = useAudioPlayer();
  const useOptimizedImage = canUseNextImage(item.image_url);

  const isHero = position === 'hero';
  const isCurrentlyPlaying = currentEpisode?.id === item.id && isPlaying;

  // Handle podcast click
  const handlePodcastClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPodcast && (item.audio_url || item.source_url)) {
      const podcastEpisodes = episodeQueue
        .filter(ep => ep.content_type === 'podcast')
        .map(ep => ({
          id: ep.id,
          title: ep.title,
          audio_url: ep.audio_url || ep.source_url,
          image_url: ep.image_url || undefined,
          episode_number: ep.episode_number,
        }));
        
      playEpisode({
        id: item.id,
        title: item.title,
        audio_url: item.audio_url || item.source_url,
        image_url: item.image_url || undefined,
        episode_number: item.episode_number,
      }, podcastEpisodes);
    }
  };

  const heroWidth = isMobile ? '300px' : 'min(60vw, 720px)';
  const cardWidth = isMobile ? '300px' : 'clamp(220px, 18vw, 320px)';
  const heroHeightClass = isMobile ? 'h-[450px]' : 'h-[450px]';
  const cardHeightClass = isMobile ? 'h-[450px]' : 'h-[450px]';

  const cardContent = (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer h-full"
    >
      {/* Card Container with Optional Padding for Border */}
      {isHero ? (
        <div className="p-1">
          <div className={`relative ${heroHeightClass} rounded-lg bg-[var(--netflix-bg)] shadow-2xl ring-2 ring-white/80`}>
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              {item.image_url ? (
                useOptimizedImage ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={isHero}
                  />
                ) : (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className={`text-white/10 ${isHero ? 'text-9xl' : 'text-6xl'}`}>
                    {badge.icon}
                  </span>
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            {/* Category Badge */}
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

            {/* Play Button */}
            <AnimatePresence>
              {(isHovered || isCurrentlyPlaying) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className={`rounded-full backdrop-blur-sm flex items-center justify-center shadow-2xl ring-2 ${
                    isHero ? 'w-16 h-16' : 'w-14 h-14'
                  } ${
                    isCurrentlyPlaying 
                      ? 'bg-[var(--netflix-red)] ring-[var(--netflix-red)]/50 animate-pulse' 
                      : 'bg-white/95 ring-white/50'
                  }`}>
                    {isPodcast ? (
                      <Mic2 className={`${isHero ? 'w-8 h-8' : 'w-7 h-7'} ${isCurrentlyPlaying ? 'text-white' : 'text-black'}`} />
                    ) : isVideo ? (
                      <Play className={`fill-current ml-1 ${isHero ? 'w-8 h-8' : 'w-7 h-7'} ${isCurrentlyPlaying ? 'text-white' : 'text-black'}`} />
                    ) : (
                      <BookOpen className={`${isHero ? 'w-8 h-8' : 'w-7 h-7'} ${isCurrentlyPlaying ? 'text-white' : 'text-black'}`} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duration Badge */}
            {item.duration && !isCurrentlyPlaying && (
              <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded text-sm font-bold text-white shadow-lg">
                {isPodcast ? `${Math.floor(parseInt(item.duration) / 60)}m` : item.duration}
              </div>
            )}

            {/* Now Playing Indicator */}
            {isCurrentlyPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-[var(--netflix-red)] px-3 py-1.5 rounded-full">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-bold text-white">Playing</span>
              </div>
            )}

            {/* Metadata INSIDE Card - Bottom */}
            <div className={`absolute bottom-0 left-0 right-0 ${isHero ? 'p-6' : 'p-4'} space-y-${isHero ? '2' : '1'}`}>
              {/* Tags */}
              <div className={`flex items-center gap-2 ${isHero ? 'text-xs' : 'text-xs'} text-white/80`}>
                {item.episode_number && (
                  <span className="font-semibold text-white">
                    {isHero ? `Episode ${item.episode_number}` : `Ep ${item.episode_number}`}
                  </span>
                )}
                {item.duration && item.episode_number && <span>•</span>}
                {item.duration && (
                  <span>{isPodcast ? `${Math.floor(parseInt(item.duration) / 60)}m` : item.duration}</span>
                )}
                {item.published_at && <span>•</span>}
                {item.published_at && <span>{formatDate(item.published_at)}</span>}
              </div>

              {/* Title */}
              <h3 className={`font-bold text-white leading-tight font-netflix line-clamp-2 ${isHero ? 'text-xl md:text-2xl' : 'text-sm md:text-base'}`}>
                {item.title}
              </h3>

              {/* Description - Only on Hero */}
              {isHero && item.description && (
                <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative ${cardHeightClass} rounded-lg overflow-hidden bg-[var(--netflix-bg)] shadow-2xl`}>
          {item.image_url ? (
            useOptimizedImage ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority={isHero}
              />
            ) : (
              <img
                src={item.image_url}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className={`text-white/10 ${isHero ? 'text-9xl' : 'text-6xl'}`}>
                {badge.icon}
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Category Badge */}
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

          {/* Play Button */}
          <AnimatePresence>
            {(isHovered || isCurrentlyPlaying) && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`rounded-full backdrop-blur-sm flex items-center justify-center shadow-2xl ring-2 ${
                  isHero ? 'w-16 h-16' : 'w-14 h-14'
                } ${
                  isCurrentlyPlaying 
                    ? 'bg-[var(--netflix-red)] ring-[var(--netflix-red)]/50 animate-pulse' 
                    : 'bg-white/95 ring-white/50'
                }`}>
                  {isPodcast ? (
                    <Mic2 className={`${isHero ? 'w-8 h-8' : 'w-7 h-7'} ${isCurrentlyPlaying ? 'text-white' : 'text-black'}`} />
                  ) : isVideo ? (
                    <Play className={`fill-current ml-1 ${isHero ? 'w-8 h-8' : 'w-7 h-7'} ${isCurrentlyPlaying ? 'text-white' : 'text-black'}`} />
                  ) : (
                    <BookOpen className={`${isHero ? 'w-8 h-8' : 'w-7 h-7'} ${isCurrentlyPlaying ? 'text-white' : 'text-black'}`} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration Badge */}
          {item.duration && !isCurrentlyPlaying && (
            <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded text-sm font-bold text-white shadow-lg">
              {isPodcast ? `${Math.floor(parseInt(item.duration) / 60)}m` : item.duration}
            </div>
          )}

          {/* Now Playing Indicator */}
          {isCurrentlyPlaying && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-[var(--netflix-red)] px-3 py-1.5 rounded-full">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-bold text-white">Playing</span>
            </div>
          )}

          {/* Metadata Inside Card */}
          <div className={`absolute bottom-0 left-0 right-0 ${isHero ? 'p-6' : 'p-4'} space-y-${isHero ? '2' : '1'}`}>
            {/* Tags */}
            <div className={`flex items-center gap-2 ${isHero ? 'text-xs' : 'text-xs'} text-white/80`}>
              {item.episode_number && (
                <span className="font-semibold text-white">
                  {isHero ? `Episode ${item.episode_number}` : `Ep ${item.episode_number}`}
                </span>
              )}
              {item.duration && item.episode_number && <span>•</span>}
              {item.duration && (
                <span>{isPodcast ? `${Math.floor(parseInt(item.duration) / 60)}m` : item.duration}</span>
              )}
              {item.published_at && <span>•</span>}
              {item.published_at && <span>{formatDate(item.published_at)}</span>}
            </div>

            {/* Title */}
            <h3 className={`font-bold text-white leading-tight font-netflix line-clamp-2 ${isHero ? 'text-xl md:text-2xl' : 'text-sm md:text-base'}`}>
              {item.title}
            </h3>

            {/* Description - Only on Hero */}
            {isHero && item.description && (
              <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: isHero ? 1 : 0.98,
      }}
      exit={{ 
        opacity: position === 'hero' ? 0 : 1,  // Only hero fades out
        x: -100 
      }}
      transition={{ 
        layout: { 
          duration: 0.7,
          ease: [0.23, 1, 0.32, 1] 
        },
        opacity: { 
          duration: 0.4,
          ease: "easeOut"
        },
        x: { 
          duration: 0.7, 
          ease: [0.23, 1, 0.32, 1] 
        },
        scale: {
          duration: 0.7,
          ease: [0.23, 1, 0.32, 1]
        },
        zIndex: {
          duration: 0.35,
          delay: 0.15
        }
      }}
      className="flex-shrink-0 snap-start"
      style={{ 
        zIndex: isHero ? 10 : (position === 'card' && index === 1) ? 5 : 1,
        width: isHero ? heroWidth : cardWidth,
        flex: '0 0 auto',
      }}
    >
      {isPodcast && (item.audio_url || item.source_url) ? (
        <div onClick={handlePodcastClick} className="cursor-pointer">
          {cardContent}
        </div>
      ) : (
        <Link href={href} target={href.startsWith("http") ? "_blank" : "_self"}>
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
  rotateInterval = 8
}: ContentRowWithHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 1920;
    return window.innerWidth;
  });

  const isMobileLayout = viewportWidth < 768;
  const isLargeLayout = viewportWidth >= 1440;

  useEffect(() => {
    const checkViewport = () => {
      if (typeof window === 'undefined') return;
      setViewportWidth(window.innerWidth);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || items.length <= 1 || isMobileLayout) return;

    const timer = setInterval(() => {
      nextSlide();
    }, rotateInterval * 1000);

    return () => clearInterval(timer);
  }, [currentIndex, autoRotate, rotateInterval, items.length, isMobileLayout]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (items.length === 0) return null;

  // Get visible items (hero + supporting cards)
  const getVisibleItems = (): VisibleItem[] => {
    const visible: VisibleItem[] = [];
    const visibleCount = isMobileLayout
      ? items.length
      : Math.min(items.length, isLargeLayout ? 4 : 3);

    for (let i = 0; i < visibleCount; i++) {
      const index = isMobileLayout ? i : (currentIndex + i) % items.length;
      const position = i === 0 ? 'hero' : 'card';
      visible.push({
        item: items[index],
        position,
        key: isMobileLayout ? `${items[index].id}-${i}` : `${items[index].id}-${currentIndex}-${i}`,
        index: index,
      });
    }
    return visible;
  };

  const visibleItems = getVisibleItems();

  return (
    <section className="mb-0">
      {/* Row Header */}
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

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        {!isMobileLayout && items.length > 3 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center hover:bg-black/90 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Cards */}
        {isMobileLayout ? (
          /* MOBILE: Netflix-Style Hero */
          <div className="px-4 space-y-6">
            {/* Hero Card - Clean Image */}
            <div className="space-y-4">
              {/* Hero Image - No Overlay */}
              <Link href={items[0].source_url || "#"} className="block">
                <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
                  {items[0].image_url && (
                    canUseNextImage(items[0].image_url) ? (
                      <Image
                        src={items[0].image_url}
                        alt={items[0].title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                      />
                    ) : (
                      <img
                        src={items[0].image_url}
                        alt={items[0].title}
                        className="w-full h-full object-cover"
                      />
                    )
                  )}
                  
                  {/* Category Badge Only */}
                  <div className="absolute top-4 left-4 z-10">
                    {(() => {
                      const topic = detectTopic(items[0]);
                      const accent = AccentColors[topic];
                      const badge = getCategoryBadge(topic);
                      return (
                        <div
                          className="px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-md shadow-lg"
                          style={{
                            backgroundColor: `${accent.primary}40`,
                            color: accent.primary,
                            border: `1.5px solid ${accent.primary}`,
                          }}
                        >
                          {badge.label}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </Link>

              {/* Content Below Image */}
              <div className="space-y-3">
                {/* Meta */}
                <div className="flex items-center gap-2 text-sm text-white/70">
                  {items[0].published_at && <time>{formatDate(items[0].published_at)}</time>}
                  {items[0].duration && (
                    <>
                      <span>•</span>
                      <span>
                        {items[0].content_type === 'podcast' 
                          ? `${Math.floor(parseInt(items[0].duration, 10) / 60) || 0}m` 
                          : items[0].duration}
                      </span>
                    </>
                  )}
                  {items[0].episode_number && (
                    <>
                      <span>•</span>
                      <span>Episode {items[0].episode_number}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight font-netflix">
                  {items[0].title}
                </h2>

                {/* Description */}
                {items[0].description && (
                  <p className="text-base text-white/80 leading-relaxed line-clamp-2">
                    {items[0].description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {/* Primary Action */}
                  <Link
                    href={items[0].source_url || "#"}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 px-6 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    {items[0].content_type === 'podcast' ? (
                      <>
                        <Mic2 className="w-5 h-5" />
                        <span>Listen</span>
                      </>
                    ) : items[0].content_type === 'video' ? (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>Watch</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        <span>Read Now</span>
                      </>
                    )}
                  </Link>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      const sourceUrl = items[0].source_url || '';
                      // Handle absolute URLs vs relative paths
                      const url = sourceUrl.startsWith('http') 
                        ? sourceUrl 
                        : `${typeof window !== 'undefined' ? window.location.origin : ''}${sourceUrl.startsWith('/') ? '' : '/'}${sourceUrl}`;
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        navigator.share({
                          title: items[0].title,
                          url: url
                        }).catch(() => {});
                      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(url);
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-white/20 text-white font-bold py-3.5 px-6 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
                    aria-label="Share"
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scroll Cards */}
            {items.length > 1 && (
              <div className="relative -mx-4">
                <div className="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pb-2">
                  {items.slice(1).map((item, idx) => (
                    <CarouselCard
                      key={item.id || idx}
                      item={item}
                      position="card"
                      index={idx + 1}
                      episodeQueue={items}
                      direction={0}
                      isMobile={true}
                    />
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none" />
              </div>
            )}
          </div>
        ) : (
          /* DESKTOP: Keep existing */
          <div className="flex gap-3 overflow-hidden group">
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleItems.map(({ item, position, key, index }) => (
                <CarouselCard
                  key={key}
                  item={item}
                  position={position as 'hero' | 'card'}
                  index={index}
                  episodeQueue={items}
                  direction={direction}
                  isMobile={isMobileLayout}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Indicators */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {items.slice(0, Math.min(items.length, 10)).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className="group"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/40 group-hover:bg-white/60'
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