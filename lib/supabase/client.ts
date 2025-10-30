import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      news_stream: {
        Row: {
          id: string
          title: string
          summary: string
          source: string
          url: string
          published_at: string
          created_at: string
          featured: boolean
          tags: string[]
        }
        Insert: {
          id?: string
          title: string
          summary: string
          source: string
          url: string
          published_at: string
          created_at?: string
          featured?: boolean
          tags?: string[]
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          source?: string
          url?: string
          published_at?: string
          created_at?: string
          featured?: boolean
          tags?: string[]
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          active: boolean
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          active?: boolean
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          page_path: string
          user_id: string | null
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          page_path: string
          user_id?: string | null
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          page_path?: string
          user_id?: string | null
          metadata?: Record<string, any>
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          article_id: string
          user_name: string
          user_email: string
          content: string
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_name: string
          user_email: string
          content: string
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_name?: string
          user_email?: string
          content?: string
          approved?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Helper functions
export async function trackEvent(
  eventType: string,
  pagePath: string,
  metadata?: Record<string, any>
) {
  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    page_path: pagePath,
    metadata: metadata || {},
  })

  if (error) console.error('Error tracking event:', error)
}

export async function subscribeToNewsletter(email: string) {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })
    .select()
    .single()

  return { data, error }
}

export async function getNewsStream(limit = 20) {
  const { data, error } = await supabase
    .from('news_stream')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)

  return { data, error }
}
