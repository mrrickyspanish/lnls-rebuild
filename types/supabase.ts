// Featured Modal Config Table Types
export type FeaturedModalConfigRow = {
  id: number;
  enabled: boolean;
  use_featured_article: boolean;
  custom_title: string | null;
  custom_subtitle: string | null;
  custom_description: string | null;
  custom_article_slug: string | null;
  custom_cta_text: string | null;
  badge_text: string | null;
  show_on_paths: string[] | null;
  dismiss_option: 'session' | 'permanent' | null;
  delay_ms: number | null;
  expires_on: string | null;
  created_at: string | null;
  updated_at: string | null;
};
export type FeaturedModalConfigInsert = Partial<FeaturedModalConfigRow> & { id?: number };
export type FeaturedModalConfigUpdate = Partial<FeaturedModalConfigRow>;
// Supabase Database Types for LNLS Platform

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ArticleBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: number };

export type TipTapMark = {
  type: string;
  attrs?: { [key: string]: Json | undefined };
};

export interface TipTapNode {
  type: string;
  attrs?: { [key: string]: Json | undefined };
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
}

export interface TipTapDocNode {
  type: 'doc';
  content?: TipTapNode[];
}

export type ArticleBody = ArticleBodyBlock[] | TipTapDocNode;

export interface Database {
  public: {
    Tables: {
      featured_modal_config: {
              Row: FeaturedModalConfigRow;
              Insert: FeaturedModalConfigInsert;
              Update: FeaturedModalConfigUpdate;
              Relationships: [];
            };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          meta_description: string | null;
          hero_image_url: string;
          image_credit: string | null;
          author_name: string;
          author_bio: string | null;
          author_twitter: string | null;
          read_time: number;
          topic: string;
          body: Json;
          video_url: string | null;
          published: boolean;
          featured: boolean;
          published_at: string | null;
          last_newsletter_sent_at: string | null;
          created_at: string;
          updated_at: string;
          views: number;
          likes: number;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          meta_description?: string | null;
          hero_image_url: string;
          image_credit?: string | null;
          author_name: string;
          author_bio?: string | null;
          author_twitter?: string | null;
          read_time: number;
          topic: string;
          body: Json;
          video_url?: string | null;
          published?: boolean;
          featured?: boolean;
          published_at?: string | null;
          last_newsletter_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          meta_description?: string | null;
          hero_image_url?: string;
          image_credit?: string | null;
          author_name?: string;
          author_bio?: string | null;
          author_twitter?: string | null;
          read_time?: number;
          topic?: string;
          body?: Json;
          video_url?: string | null;
          published?: boolean;
          featured?: boolean;
          published_at?: string | null;
          last_newsletter_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [];
      };
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
        Relationships: [];
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
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          resource_type: 'article' | 'episode' | 'page';
          resource_id: string;
          user_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          resource_type: 'article' | 'episode' | 'page';
          resource_id: string;
          user_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          resource_type?: 'article' | 'episode' | 'page';
          resource_id?: string;
          user_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      youtube_videos: {
        Row: {
          id: number;
          video_id: string;
          title: string;
          description: string | null;
          published_at: string;
          thumbnail_url: string | null;
          duration: string | null;
          view_count: number;
          is_short: boolean;
          playlist_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          video_id: string;
          title: string;
          description?: string | null;
          published_at: string;
          thumbnail_url?: string | null;
          duration?: string | null;
          view_count?: number;
          is_short?: boolean;
          playlist_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          video_id?: string;
          title?: string;
          description?: string | null;
          published_at?: string;
          thumbnail_url?: string | null;
          duration?: string | null;
          view_count?: number;
          is_short?: boolean;
          playlist_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          active: boolean;
          unsubscribe_token: string | null;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
          active?: boolean;
          unsubscribe_token?: string | null;
          unsubscribed_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
          active?: boolean;
          unsubscribe_token?: string | null;
          unsubscribed_at?: string | null;
        };
        Relationships: [];
      };
      ai_news_stream: {
        Row: {
          id: string;
          title: string;
          summary: string;
          source_url: string;
          source_name: string;
          published_at: string;
          image_url: string | null; // Added image_url
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
          image_url?: string | null; // Added image_url
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
          image_url?: string | null; // Added image_url
          category?: string;
          tags?: string[];
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          relevance_score?: number;
          status?: 'pending' | 'approved' | 'featured' | 'ignored';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_article_views: {
        Args: {
          article_slug: string;
        };
        Returns: void;
      };
      increment_article_likes: {
        Args: {
          article_slug: string;
          delta: number;
        };
        Returns: {
          new_likes: number;
        }[];
      };
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

export type YouTubeVideoRow = Database['public']['Tables']['youtube_videos']['Row'];
export type YouTubeVideoInsert = Database['public']['Tables']['youtube_videos']['Insert'];
export type YouTubeVideoUpdate = Database['public']['Tables']['youtube_videos']['Update'];

export type ArticleTableRow = Database['public']['Tables']['articles']['Row'];
type ArticleTableInsert = Database['public']['Tables']['articles']['Insert'];
type ArticleTableUpdate = Database['public']['Tables']['articles']['Update'];

export type Article = Omit<ArticleTableRow, 'body'> & {
  body: ArticleBody;
  views: number;
  likes: number;
};

export type ArticleInsert = Omit<ArticleTableInsert, 'body'> & {
  body: ArticleBody;
};

export type ArticleUpdate = Omit<ArticleTableUpdate, 'body'> & {
  body?: ArticleBody;
};

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
