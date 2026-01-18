'use client'

import React from 'react'

export type StreamTab = 'latest' | 'videos'

export default function StreamTabs({
  value,
  onChange,
}: {
  value: StreamTab
  onChange: (v: StreamTab) => void
}) {
  const isLatest = value === 'latest'

  return (
    <div className="relative pt-3 pb-0">
      {/* Full-width divider line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-white/10" />
      
      <div className="relative mx-auto w-full max-w-[360px] px-4 bg-black">
        <div className="relative rounded-full bg-black bg-white/15 p-[3px]">
          {/* Active pill */}
          <div
            className={[
              'absolute top-[2px] bottom-[2px] left-[2px] z-0 rounded-full bg-[#2FE6C8] shadow-[0_0_0_1px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out',
              'w-[calc(50%-4px)]',
              isLatest ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]',
            ].join(' ')}
          />

          <div className="relative z-10 flex">
            <button
              type="button"
              onClick={() => onChange('latest')}
              role="tab"
              aria-selected={isLatest}
              className={[
                'flex-1 rounded-full px-4 py-2 text-sm font-extrabold uppercase leading-none',
                'tracking-[0.18em] transition-colors',
                isLatest ? 'text-black' : 'text-white/60 hover:text-white',
              ].join(' ')}
            >
              Latest
            </button>

            <button
              type="button"
              onClick={() => onChange('videos')}
              role="tab"
              aria-selected={!isLatest}
              className={[
                'flex-1 rounded-full px-4 py-2 text-sm font-extrabold uppercase leading-none',
                'tracking-[0.18em] transition-colors',
                isLatest ? 'text-white/60 hover:text-white' : 'text-black',
              ].join(' ')}
            >
              Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
