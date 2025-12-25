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
      <span className="text-2xl font-bold tracking-tighter flex items-center">
        <span className="text-white">itsDribbles</span>
        <span
          className="flex items-end ml-2"
          style={{ alignItems: 'flex-end' }}
        >
          <motion.span
            className="inline-block rounded-full mr-1 w-2 h-2 md:w-2 md:h-2 align-bottom"
            style={{
              background: 'var(--neon-orange)',
              boxShadow: '0 0 12px var(--neon-orange)',
              verticalAlign: 'bottom',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="inline-block rounded-full mr-1 w-2 h-2 md:w-2 md:h-2 align-bottom"
            style={{
              background: 'var(--neon-blue)',
              boxShadow: '0 0 12px var(--neon-blue)',
              verticalAlign: 'bottom',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="inline-block rounded-full w-2 h-2 md:w-2 md:h-2 align-bottom"
            style={{
              background: 'var(--neon-purple)',
              boxShadow: '0 0 12px var(--neon-purple)',
              verticalAlign: 'bottom',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </span>
      </span>
    </Link>
  )
}
