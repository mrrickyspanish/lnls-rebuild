"use client";

import { motion } from "framer-motion";

type LinearProgressProps = {
  progress: number; // 0-100
  className?: string;
};

export default function LinearProgress({ progress, className = "" }: LinearProgressProps) {
  return (
    <div className={`h-1 bg-white/20 rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full bg-[var(--netflix-red)]"
      />
    </div>
  );
}