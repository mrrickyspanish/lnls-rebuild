"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AccentColors, detectTopic, getCategoryBadge } from "@/lib/theme/tokens";
import PlayerModal from "@/components/podcast/PlayerModal";

type ContentCardProps = {
  id: string;
  title: string;
  excerpt?: string;
  image_url?: string | null;
  content_type?: string;
  source?: string;
  source_url?: string | null;
  published_at?: string | null;
  priority?: boolean;
  size?: "hero" | "featured" | "standard" | "banner";
  lightMode?: boolean;
};

export default function ContentCard({
  id,
  title,
  excerpt,
  image_url,
  content_type,
  source,
  source_url,
  published_at,
  priority = false,
  size = "standard",
  lightMode = false,
}: ContentCardProps) {
  const topic = detectTopic({ title, content_type, source, excerpt });
  const accent = AccentColors[topic];
  const badge = getCategoryBadge(topic);
  const href = source_url || "#";

  const isHero = size === "hero";
  const isBanner = size === "banner";
  const isFeatured = size === "featured";
  const isPodcast = (content_type || "").toLowerCase() === "podcast" && !!source_url;

  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : "_self"}
      className="block h-full group"
    >
      <motion.div
        className={`relative h-full w-full rounded-2xl overflow-hidden ${
          lightMode ? "bg-white" : "bg-slate-900/80"
        } backdrop-blur-sm border ${accent.ring} transition-all duration-200 hover:translate-y-[-4px] hover:shadow-2xl ${accent.glow}`}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Podcast Play overlay (top-right) */}
        {isPodcast && (
          <div className="absolute top-3 right-3 z-20 pointer-events-auto">
            <PlayerModal
              url={source_url as string}
              trigger={
                <span className="inline-flex items-center gap-1">
                  <span className="text-[10px]">►</span>
                  <span>Play</span>
                </span>
              }
            />
          </div>
        )}

        {image_url && (
          <div className={`relative ${isBanner ? "h-32" : "h-full"} w-full`}>
            <Image
              src={image_url}
              alt={title}
              fill
              priority={priority}
              className={`object-cover ${lightMode ? "" : ""}`}
              sizes={
                isHero
                  ? "(max-width: 768px) 100vw, 50vw"
                  : isBanner
                  ? "100vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
            />
            {!lightMode && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            )}
          </div>
        )}

        {!image_url && (
          <div className={`absolute inset-0 ${lightMode ? "bg-gray-100" : "bg-gradient-to-br from-slate-800/50 to-slate-900/80"} grid place-items-center`}>
            <span className={`${lightMode ? "text-gray-400" : "text-white/20"} text-6xl`} aria-hidden>
              {badge.icon}
            </span>
          </div>
        )}

        <div
          className={`absolute inset-0 flex flex-col ${
            isBanner ? "flex-row items-center" : "justify-end"
          } p-5 md:p-6`}
        >
          <div className="absolute top-4 left-4 z-10">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5"
              style={{
                backgroundColor: `${accent.primary}20`,
                color: accent.primary,
                border: `1px solid ${accent.primary}40`,
              }}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          </div>

          <div className={`${isBanner ? "ml-auto max-w-2xl" : ""} space-y-2`}>
            {(content_type || published_at) && (
              <div className={`flex items-center gap-2 text-xs ${lightMode ? "text-gray-600" : "text-slate-400"} uppercase tracking-wide`}>
                {content_type && <span>{content_type}</span>}
                {published_at && content_type && <span>•</span>}
                {published_at && (
                  <span>{new Date(published_at).toLocaleDateString()}</span>
                )}
              </div>
            )}

            <h3
              className={`font-semibold leading-tight ${
                lightMode ? "text-gray-900" : "text-white"
              } ${isHero ? "text-2xl md:text-3xl lg:text-4xl" : ""} ${
                isFeatured ? "text-xl md:text-2xl" : ""
              } ${isBanner ? "text-xl md:text-2xl" : ""} ${
                size === "standard" ? "text-lg md:text-xl" : ""
              } group-hover:text-opacity-90 transition-colors`}
            >
              {title}
            </h3>

            {excerpt && (isHero || isBanner) && (
              <p className={`${lightMode ? "text-gray-700" : "text-slate-300"} text-sm md:text-base line-clamp-2 max-w-2xl`}>
                {excerpt}
              </p>
            )}

            {source && (
              <div className={`text-xs ${lightMode ? "text-gray-600" : "text-slate-400"}`}>
                via <span className={`${lightMode ? "text-gray-800" : "text-slate-300"}`}>{source}</span>
              </div>
            )}
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: accent.primary }}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </Link>
  );
}
