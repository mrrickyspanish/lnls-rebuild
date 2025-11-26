'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface AnimatedLogoProps {
  href?: string
  className?: string
}

export default function AnimatedLogo({ href = '/', className }: AnimatedLogoProps) {
  return (
    <Link href={href} className={clsx('flex items-center group', className)}>
      <span className="text-2xl font-bold tracking-tighter">
        <span className="text-white group-hover:text-[var(--netflix-red)] transition-colors">T</span>
        <span className="text-white group-hover:text-[var(--netflix-red)] transition-colors delay-75">D</span>
        <span className="text-white group-hover:text-[var(--netflix-red)] transition-colors delay-100">D</span>
      </span>
      <motion.div className="ml-2 flex gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {[0, 0.2, 0.4].map((delay) => (
          <motion.div
            key={delay}
            className="w-1 h-1 rounded-full bg-[var(--netflix-red)]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay }}
          />
        ))}
      </motion.div>
    </Link>
  )
}
