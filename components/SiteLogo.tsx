"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SiteLogo() {
  return (
    <Link href="/" className="flex items-end gap-1 select-none justify-center">
      <span 
        className="font-extrabold tracking-tighter text-white leading-none drop-shadow-lg text-5xl md:text-7xl"
        style={{letterSpacing: '-0.04em'}}
      >
        itsDribbles
      </span>
      <span className="flex gap-[2px] ml-1 mb-[0.2em]">
        <motion.span
          className="rounded-full inline-block w-2 h-2 md:w-2.5 md:h-2.5"
          style={{ background: 'var(--neon-orange, #FD6B0B)', boxShadow: '0 0 4px var(--neon-orange, #FD6B0B)' }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="rounded-full inline-block w-2 h-2 md:w-2.5 md:h-2.5"
          style={{ background: 'var(--neon-blue, #00e6fe)', boxShadow: '0 0 4px var(--neon-blue, #00e6fe)' }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: 0.18 }}
        />
        <motion.span
          className="rounded-full inline-block w-2 h-2 md:w-2.5 md:h-2.5"
          style={{ background: 'var(--neon-purple, #a259f7)', boxShadow: '0 0 4px var(--neon-purple, #a259f7)' }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: 0.36 }}
        />
      </span>
    </Link>
  );
}
