"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LivingTile() {
  const reduce = useReducedMotion();
  const [shootingStar, setShootingStar] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const interval = setInterval(() => {
      setShootingStar(true);
      setTimeout(() => setShootingStar(false), 1000);
    }, 8000);
    return () => clearInterval(interval);
  }, [reduce]);

  return (
    <div
      className="relative h-full w-full rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/30"
      aria-label="Live broadcast indicator"
    >
      {!reduce && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(circle at center, rgba(96, 165, 250, 0.15) 0%, transparent 70%)",
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0.8, y: 0 }}
        animate={{
          opacity: reduce ? 1 : [0.8, 1, 0.9, 1],
          y: reduce ? 0 : [0, -3, 2, -1, 0],
          scale: reduce ? 1 : [1, 1.05, 0.98, 1.02, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 pointer-events-none select-none"
      >
        <div className="flex items-center gap-2 text-3xl md:text-4xl">
          <motion.span animate={reduce ? {} : { rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            ✨
          </motion.span>
          <motion.span animate={reduce ? {} : { scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>
            ⭐
          </motion.span>
          <motion.span animate={reduce ? {} : { rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>
            ✨
          </motion.span>
        </div>
      </motion.div>

      {shootingStar && !reduce && (
        <motion.div
          className="absolute top-2 right-2 text-yellow-300 text-xl"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: -60, y: 60, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          ✨
        </motion.div>
      )}

      {!reduce && (
        <>
          <motion.div
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{ top: "20%", left: "15%" }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{ top: "70%", right: "20%" }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </>
      )}
    </div>
  );
}
