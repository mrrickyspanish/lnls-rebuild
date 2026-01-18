'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface AnimatedLogoProps {
  href?: string
  className?: string
  size?: 'sm' | 'lg'
}

export default function AnimatedLogo({ href = '/', className, size = 'sm' }: AnimatedLogoProps) {
  return (
    <Link 
      href={href} 
      className={clsx('inline-flex items-center group', className)}
      aria-label="itsDribbles home"
    >
      {/* LOCKED: items-baseline alignment with ml-[0.05em] and gap-[0.08em] - DO NOT MODIFY */}
      <span className={clsx(
        'flex items-baseline font-extrabold tracking-tight leading-none',
        size === 'lg' ? 'text-[65px]' : 'text-2xl'
      )}>
        <span className="text-white">itsDribbles</span>
        <span className="inline-flex items-center gap-[0.08em] ml-[0.05em]">
          <motion.span
            className={clsx(
              'inline-block rounded-full',
              size === 'lg' ? 'w-[4px] h-[4px]' : 'w-[2.5px] h-[2.5px]'
            )}
            style={{
              background: 'var(--neon-orange)',
              boxShadow: '0 0 8px var(--neon-orange)',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            aria-hidden="true"
          />
          <motion.span
            className={clsx(
              'inline-block rounded-full',
              size === 'lg' ? 'w-[4px] h-[4px]' : 'w-[2.5px] h-[2.5px]'
            )}
            style={{
              background: 'var(--neon-blue)',
              boxShadow: '0 0 8px var(--neon-blue)',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            aria-hidden="true"
          />
          <motion.span
            className={clsx(
              'inline-block rounded-full',
              size === 'lg' ? 'w-[4px] h-[4px]' : 'w-[2.5px] h-[2.5px]'
            )}
            style={{
              background: 'var(--neon-purple)',
              boxShadow: '0 0 8px var(--neon-purple)',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            aria-hidden="true"
          />
        </span>
      </span>
    </Link>
  )
}
