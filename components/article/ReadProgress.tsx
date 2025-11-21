"use client";

import { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';

export default function ReadProgress() {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setProgress(latest * 100);
    });
  }, [scrollYProgress]);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
      <motion.div
        className="h-full bg-[var(--netflix-red)]"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}