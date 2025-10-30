// Supabase Database Types for LNLS Platform

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'editor' | 'writer' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'editor' | 'writer' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'editor' | 'writer' | 'user';
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          article_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          status: 'pending' | 'approved' | 'spam' | 'deleted';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_id: string;
          parent_id?: string | null;
          content: string;
          status?: 'pending' | 'approved' | 'spam' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          user_id?: string;
          parent_id?: string | null;
          content?: string;
          status?: 'pending' | 'approved' | 'spam' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          resource_type: 'article' | 'episode' | 'page';
          resource_id: string;
          user_id: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          resource_type: 'article' | 'episode' | 'page';
          resource_id: string;
          user_id?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          resource_type?: 'article' | 'episode' | 'page';
          resource_id?: string;
          user_id?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          status: 'active' | 'unsubscribed' | 'bounced';
          preferences: Record<string, any> | null;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          status?: 'active' | 'unsubscribed' | 'bounced';
          preferences?: Record<string, any> | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          status?: 'active' | 'unsubscribed' | 'bounced';
          preferences?: Record<string, any> | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
      };
      ai_news_stream: {
        Row: {
          id: string;
          title: string;
          summary: string;
          source_url: string;
          source_name: string;
          published_at: string;
          category: string;
          tags: string[];
          sentiment: 'positive' | 'neutral' | 'negative' | null;
          relevance_score: number;
          status: 'pending' | 'approved' | 'featured' | 'ignored';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary: string;
          source_url: string;
          source_name: string;
          published_at: string;
          category: string;
          tags?: string[];
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          relevance_score?: number;
          status?: 'pending' | 'approved' | 'featured' | 'ignored';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string;
          source_url?: string;
          source_name?: string;
          published_at?: string;
          category?: string;
          tags?: string[];
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          relevance_score?: number;
          status?: 'pending' | 'approved' | 'featured' | 'ignored';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'editor' | 'writer' | 'user';
      comment_status: 'pending' | 'approved' | 'spam' | 'deleted';
      subscriber_status: 'active' | 'unsubscribed' | 'bounced';
      news_status: 'pending' | 'approved' | 'featured' | 'ignored';
    };
  };
}

// Helper types for common queries
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];
export type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert'];

export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];
export type NewsletterSubscriberInsert = Database['public']['Tables']['newsletter_subscribers']['Insert'];
export type NewsletterSubscriberUpdate = Database['public']['Tables']['newsletter_subscribers']['Update'];

export type AINewsItem = Database['public']['Tables']['ai_news_stream']['Row'];
export type AINewsItemInsert = Database['public']['Tables']['ai_news_stream']['Insert'];
export type AINewsItemUpdate = Database['public']['Tables']['ai_news_stream']['Update'];

// Comment with nested user data
export interface CommentWithUser extends Comment {
  user: Profile;
  replies?: CommentWithUser[];
}

// Analytics aggregation types
export interface AnalyticsSummary {
  total_views: number;
  total_reads: number;
  unique_visitors: number;
  top_articles: Array<{
    resource_id: string;
    title: string;
    view_count: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}
