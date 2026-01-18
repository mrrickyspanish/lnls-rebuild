"use client";

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Prevent double tracking in development (React StrictMode)
    if (hasTracked.current) return;
    hasTracked.current = true;

    const trackView = async () => {
      // Check if we've already tracked this article recently
      const storageKey = `article_view_${slug}`;
      const lastViewTime = localStorage.getItem(storageKey);
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // If viewed within last 24 hours, don't count again
      if (lastViewTime) {
        const timeSinceLastView = now - parseInt(lastViewTime, 10);
        if (timeSinceLastView < ONE_DAY) {
          return; // Skip tracking
        }
      }

      // Track the view
      try {
        const response = await fetch('/api/articles/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug }),
        });

        if (response.ok) {
          // Store the current timestamp
          localStorage.setItem(storageKey, now.toString());
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    // Small delay to ensure it's a real visit (not just a bot quickly leaving)
    const timer = setTimeout(trackView, 2000);
    return () => clearTimeout(timer);
  }, [slug]);

  return null; // This component doesn't render anything
}
