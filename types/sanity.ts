// Sanity Document Types for LNLS Platform

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
}

export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityReference {
  _type: 'reference';
  _ref: string;
}

export interface SanityBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
  children: Array<{
    _type: 'span';
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    href?: string;
  }>;
  listItem?: 'bullet' | 'number';
  level?: number;
}

// Author Schema
export interface Author {
  _id: string;
  _type: 'author';
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: SanitySlug;
  bio?: SanityBlock[];
  image?: SanityImage;
  twitter?: string;
  instagram?: string;
  role?: string;
}

// Category Schema
export interface Category {
  _id: string;
  _type: 'category';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: SanitySlug;
  description?: string;
  color?: string;
}

// Article Schema
export interface Article {
  _id: string;
  _type: 'article';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: SanitySlug;
  excerpt?: string;
  mainImage?: SanityImage;
  body: SanityBlock[];
  author: Author | SanityReference;
  categories?: (Category | SanityReference)[];
  tags?: string[];
  publishedAt: string;
  featured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  socialPreviews?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  readTime?: number;
  views?: number;
}

// Episode Schema
export interface Episode {
  _id: string;
  _type: 'episode';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: SanitySlug;
  episodeNumber?: number;
  season?: number;
  description?: string;
  coverImage?: SanityImage;
  audioUrl: string;
  duration?: number;
  publishedAt: string;
  hosts?: (Author | SanityReference)[];
  guests?: string[];
  showNotes?: SanityBlock[];
  topics?: string[];
  spreakerId?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  featured?: boolean;
}

// Site Settings Schema
export interface SiteSettings {
  _id: string;
  _type: 'siteSettings';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  description: string;
  logo?: SanityImage;
  favicon?: SanityImage;
  ogImage?: SanityImage;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    threads?: string;
  };
  navigation?: Array<{
    _key: string;
    title: string;
    url: string;
  }>;
  footer?: {
    text?: string;
    links?: Array<{
      _key: string;
      title: string;
      url: string;
    }>;
  };
}

// Utility Types
export type SanityDocument = Article | Episode | Author | Category | SiteSettings;

export interface PaginatedResults<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ArticleListItem extends Omit<Article, 'body'> {
  author: Author;
  categories?: Category[];
}

export interface EpisodeListItem extends Omit<Episode, 'showNotes'> {
  hosts?: Author[];
}

// Query Params
export interface ArticleQueryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  sortBy?: 'publishedAt' | 'views' | 'title';
  order?: 'asc' | 'desc';
}

export interface EpisodeQueryParams {
  page?: number;
  pageSize?: number;
  season?: number;
  featured?: boolean;
  sortBy?: 'publishedAt' | 'episodeNumber';
  order?: 'asc' | 'desc';
}
