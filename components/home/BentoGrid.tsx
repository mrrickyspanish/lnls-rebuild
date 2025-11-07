"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ContentCard from "./ContentCard";
import LivingTile from "./LivingTile";
import { detectTopic, type Topic } from "@/lib/theme/tokens";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import VideoModal from "../VideoModal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer, { StaggerItem, staggerItemVariants } from "@/components/animations/StaggerContainer";

type ContentItem = {
  id: string;
  title: string;
  excerpt?: string;
  image_url?: string | null;
  content_type?: string;
  source?: string;
  source_url?: string | null;
  published_at?: string | null;
  audio_url?: string;
  episode_number?: number;
};

type HeroCandidate =
  | { type: "podcast"; data: any }
  | { type: "video"; data: ContentItem }
  | { type: "article"; data: ContentItem };

type BentoGridProps = {
  box1: HeroCandidate | null;
  box2: HeroCandidate | null;
  items: ContentItem[];
};

const FILTERS: Array<"all" | Topic> = [
  "all",
  "lakers",
  "nba",
  "video",
  "podcast",
  "tech",
  "entertainment",
];

export default function BentoGrid({ box1, box2, items }: BentoGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playEpisode } = useAudioPlayer();

  const [filter, setFilter] = useState<"all" | Topic>("all");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  // Sync filter with querystring on mount
  useEffect(() => {
    const topicParam = searchParams.get("topic") as Topic | null;
    if (topicParam && FILTERS.includes(topicParam)) {
      setFilter(topicParam);
    }
  }, [searchParams]);

  // Update querystring when filter changes
  const handleFilterChange = (newFilter: "all" | Topic) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("topic");
    } else {
      params.set("topic", newFilter);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : "/";
    router.push(newUrl, { scroll: false });
  };

  // Keyboard navigation for filters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }
      const currentIndex = FILTERS.indexOf(filter);
      if (e.key === "ArrowRight" && currentIndex < FILTERS.length - 1) {
        e.preventDefault();
        handleFilterChange(FILTERS[currentIndex + 1]);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        handleFilterChange(FILTERS[currentIndex - 1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filter]);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No content available</p>
      </div>
    );
  }

  // Convert box1/box2 to ContentItem format
  const hero: ContentItem = box1
    ? box1.type === "podcast"
      ? { ...box1.data, content_type: "podcast" }
      : box1.data
    : items[0];

  const secondBox: ContentItem = box2
    ? box2.type === "podcast"
      ? { ...box2.data, content_type: "podcast" }
      : box2.data
    : items[1];

  const topTiles = [secondBox, ...items.slice(2, 5)];
  const gridItems = items.slice(5);

  const filtered = useMemo(() => {
    if (filter === "all") return gridItems;
    return gridItems.filter((it) => detectTopic(it) === filter);
  }, [gridItems, filter]);

  // Click handler for hero card
  const handleHeroClick = () => {
    if (hero.content_type === "podcast" && hero.audio_url) {
      playEpisode({
        id: hero.id,
        title: hero.title,
        audio_url: hero.audio_url,
        image_url: hero.image_url ?? undefined,
        episode_number: hero.episode_number,
      });
    } else if (hero.content_type === "video" && hero.source_url) {
      setSelectedVideo({ url: hero.source_url, title: hero.title });
      setVideoModalOpen(true);
    }
  };

  // Click handler for second box
  const handleSecondBoxClick = () => {
    if (secondBox.content_type === "podcast" && secondBox.audio_url) {
      playEpisode({
        id: secondBox.id,
        title: secondBox.title,
        audio_url: secondBox.audio_url,
        image_url: secondBox.image_url ?? undefined,
        episode_number: secondBox.episode_number,
      });
    } else if (secondBox.content_type === "video" && secondBox.source_url) {
      setSelectedVideo({ url: secondBox.source_url, title: secondBox.title });
      setVideoModalOpen(true);
    }
  };

  return (
    <div className="w-full">
      {/* DARK SECTION - Featured Bento with stagger animation */}
      <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <section className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-4 md:p-6 shadow-2xl">
            <StaggerContainer 
              staggerDelay={0.15}
              className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-20 auto-rows-[130px] sm:auto-rows-[150px] lg:auto-rows-[160px]"
            >
              <StaggerItem
                variants={staggerItemVariants}
                className="col-span-1 sm:col-span-12 row-span-2 cursor-pointer"
                onClick={handleHeroClick}
              >
                <ContentCard {...hero} size="hero" priority />
              </StaggerItem>

              <StaggerItem
                variants={staggerItemVariants}
                className="col-span-1 sm:col-span-8 row-span-2 cursor-pointer"
                onClick={handleSecondBoxClick}
              >
                <ContentCard {...topTiles[0]} size="standard" />
              </StaggerItem>

              <StaggerItem
                variants={staggerItemVariants}
                className="col-span-1 sm:col-span-6 row-span-2"
              >
                <ContentCard {...topTiles[1]} size="standard" />
              </StaggerItem>

              <StaggerItem
                variants={staggerItemVariants}
                className="col-span-1 sm:col-span-6 row-span-2"
              >
                <ContentCard {...topTiles[2]} size="standard" />
              </StaggerItem>

              <StaggerItem
                variants={staggerItemVariants}
                className="col-span-1 sm:col-span-8 row-span-2"
              >
                <LivingTile />
              </StaggerItem>
            </StaggerContainer>
          </section>
        </div>
      </div>

      {/* WHITE PANE with scroll reveal */}
      <div className="relative w-full">
        <div
          className="
            relative
            -mt-12 md:-mt-16
            bg-white
            rounded-t-[48px]
            shadow-[0_-16px_48px_rgba(0,0,0,0.28)]
            border-t border-gray-200/90
          "
        >
          {/* subtle dark lip under the curve for depth */}
          <div className="pointer-events-none absolute -top-px left-0 right-0 h-[22px] rounded-t-[48px] bg-gradient-to-b from-slate-900/60 to-transparent" />

          <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12 pt-12 pb-16">
            {/* Header + Tabs with scroll reveal */}
            <ScrollReveal direction="up" delay={0.1} fullWidth>
              <div className="mb-6 md:mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">More Stories</h2>
                  <p className="text-gray-600">Catch up on the latest NBA news and updates</p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap gap-2 rounded-full bg-gray-100 p-1"
                  role="tablist"
                  aria-label="Content filters"
                >
                  {FILTERS.map((f, index) => {
                    const active = f === filter;
                    const label = f === "all" ? "All" : f[0].toUpperCase() + f.slice(1);
                    return (
                      <motion.button
                        key={f}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        onClick={() => handleFilterChange(f as any)}
                        role="tab"
                        aria-selected={active}
                        aria-controls="content-grid"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={[
                          "px-3.5 py-1.5 rounded-full text-sm transition",
                          active
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/70",
                        ].join(" ")}
                      >
                        {label}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Grid with stagger animation */}
            <StaggerContainer
              staggerDelay={0.08}
              className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((item) => (
                <StaggerItem
                  key={item.id}
                  variants={staggerItemVariants}
                  className="h-[360px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <ContentCard {...item} size="standard" lightMode={true} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoModalOpen && selectedVideo && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
}
