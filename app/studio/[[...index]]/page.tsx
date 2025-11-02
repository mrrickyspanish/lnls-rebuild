'use client';

import { Studio } from 'sanity';
import config from '@/sanity.config';

// Keep Studio fully client-rendered
export const revalidate = 0;
export const dynamic = 'force-static';

export default function StudioPage() {
  return <Studio config={config} />;
}
