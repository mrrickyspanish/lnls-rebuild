"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

type ComingSoonRowProps = {
  title: string;
  description: string;
};

export default function ComingSoonRow({ title, description }: ComingSoonRowProps) {
  return (
    <section className="mb-0">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--netflix-text)] font-netflix tracking-tight">
          {title}
        </h2>
        <div className="px-3 py-1 bg-yellow-600/20 text-yellow-500 text-xs font-bold rounded-full border border-yellow-600/40">
          COMING SOON
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="relative h-[200px] rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Lock className="w-12 h-12 text-white/30" />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-[var(--netflix-muted)] max-w-md">
              {description}
            </p>
          </div>

          <div className="mt-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-xs text-white/60">
            New content sources launching soon
          </div>
        </div>

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </section>
  );
}