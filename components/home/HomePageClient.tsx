'use client'

import { useState, createContext, useContext } from 'react'
import type { StreamTab } from '@/components/StreamTabs'
import ContentRowWithHero from './ContentRowWithHero'

type ContentItem = {
  id: string | number
  title: string
  excerpt?: string
  description?: string
  image_url?: string | null
  content_type?: string | null
  source?: string
  source_url?: string | null
  published_at?: string | null
  author_name?: string
  author?: string
  topic?: string
  featured?: boolean
  duration?: string | null
  episode_number?: number | null
  is_featured?: boolean
}

interface HomePageClientProps {
  allHeroItems: ContentItem[]
}

// Create context for tab state
const TabContext = createContext<{
  activeTab: StreamTab
  setActiveTab: (tab: StreamTab) => void
} | null>(null)

export function useTabContext() {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useTabContext must be used within TabProvider')
  }
  return context
}

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<StreamTab>('latest')
  
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export default function HomePageClient({ allHeroItems }: HomePageClientProps) {
  const { activeTab } = useTabContext()

  // Filter content based on active tab
  const filteredHeroItems = activeTab === 'videos' 
    ? allHeroItems.filter(item => item.content_type === 'video')
    : allHeroItems

  return (
    <>
      {/* Hero section: no horizontal padding or max-width */}
      {filteredHeroItems.length > 0 && (
        <div className="mt-0">
          <ContentRowWithHero
            title=""
            items={filteredHeroItems}
          />
        </div>
      )}
    </>
  )
}
