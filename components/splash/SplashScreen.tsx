"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(false);
      return;
    }

    setShouldAnimate(true);

    const timer = window.setTimeout(() => setIsVisible(false), 2800);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={shouldAnimate ? { opacity: [1, 1, 0] } : { opacity: 0 }}
      transition={{ duration: 3, times: [0, 0.9, 1] }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-none"
    >
      <div className="flex flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="text-6xl md:text-8xl font-display font-bold text-white"
        >
          TDD
        </motion.div>

        <div className="flex gap-6">
          {['bg-primary', 'bg-secondary', 'bg-accent'].map((color, index) => (
            <motion.div
              key={color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
              transition={{ delay: 0.3 + index * 0.3, duration: 0.8 }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${color}`}
              style={{
                boxShadow:
                  color === 'bg-primary'
                    ? '0 0 50px rgba(255,107,53,0.85)'
                    : color === 'bg-secondary'
                    ? '0 0 50px rgba(0,212,255,0.85)'
                    : '0 0 50px rgba(184,87,255,0.85)',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
