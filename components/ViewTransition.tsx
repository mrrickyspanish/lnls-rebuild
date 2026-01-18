"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ViewTransition component that enables smooth page transitions
 * using the View Transitions API when available
 */
export default function ViewTransition() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      return;
    }

    // The pathname change will automatically trigger view transitions
    // thanks to the meta tag and CSS we've set up
  }, [pathname]);

  return null;
}
