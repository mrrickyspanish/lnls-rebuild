"use client";

type ContentTileSkeletonProps = {
  size?: 'default' | 'small';
};

export default function ContentTileSkeleton({ size = 'default' }: ContentTileSkeletonProps) {
  const heightClass = size === 'small' ? 'h-[375px]' : 'h-[450px]';
  const widthClass = size === 'small' ? 'w-[250px]' : 'w-[300px]';

  return (
    <div
      className={`${widthClass} ${heightClass} flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative`}
    >
      {/* Image skeleton */}
      <div className="h-[60%] w-full bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Badge skeleton */}
        <div className="w-20 h-5 rounded-full bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] animate-pulse" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] rounded animate-pulse" />
        </div>
        
        {/* Meta info skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] rounded animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] animate-pulse" />
          <div className="h-3 w-20 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)] rounded animate-pulse" />
        </div>
      </div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
}
