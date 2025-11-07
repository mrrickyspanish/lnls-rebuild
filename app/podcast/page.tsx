"use client";
import { customEase } from "@/components/animations/easing";
import type { Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";

type Episode = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  published_at: string;
  image_url?: string;
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: customEase } },
};

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/podcast/episodes", { next: { revalidate: 300 } });
        const json = await res.json();
        if (!json?.success) throw new Error("Failed to load episodes");
        setEpisodes(json.episodes || []);
      } catch (e: any) {
        setError(e?.message || "Unknown error");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Podcast</h1>
          <p className="text-red-400">Error loading episodes: {error}</p>
        </div>
      </div>
    );
  }

  if (!episodes) {
    return (
      <div className="min-h-screen bg-slate-950 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Podcast</h1>
          <p className="text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  const featured = episodes[0];
  const rest = episodes.slice(1);

  if (!featured) {
    return (
      <div className="min-h-screen bg-slate-950 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Podcast</h1>
          <p className="text-slate-400">No episodes available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 md:py-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="mb-8">
            <h1 className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-300 to-cyan-200 mb-4">
              Podcast
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">Listen to the latest episodes of Late Night Lake Show.</p>
          </div>
        </ScrollReveal>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ScrollReveal direction="up" delay={0.15}>
              <div className="rounded-2xl overflow-hidden bg-slate-900 p-6 border border-slate-800">
                <h2 className="text-2xl font-semibold text-white mb-2">{featured.title}</h2>
                <audio controls src={featured.audio_url} className="w-full mt-4" />
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-1">
            <StaggerContainer staggerDelay={0.05} className="space-y-4">
              {rest.slice(0, 20).map((ep) => (
                <StaggerItem key={ep.id} variants={staggerItemVariants}>
                  <motion.div
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900 transition-colors"
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-white font-medium line-clamp-2">{ep.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mt-1">{ep.description}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
