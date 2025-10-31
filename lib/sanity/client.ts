import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-10-28',
  useCdn: process.env.NODE_ENV === 'production',
}

// Lazy client creation
export function getClient() {
  return createClient(sanityConfig)
}

export function getWriteClient() {
  return createClient({
    ...sanityConfig,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  })
}

export function urlFor(source: SanityImageSource) {
  const client = getClient()
  const builder = imageUrlBuilder(client)
  return builder.image(source)
}

// GROQ query helpers
export const queries = {
  // Get all published articles
  articles: `*[_type == "article" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage,
    "author": author->{name, slug, image},
    "categories": categories[]->{title, slug, color},
    featured
  }`,

  // Get single article by slug
  articleBySlug: (slug: string) => `*[_type == "article" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage,
    body,
    "author": author->{name, slug, image, bio, role, social},
    "categories": categories[]->{title, slug, color},
    seo,
    aiGenerated
  }`,

  // Get featured articles
  featuredArticles: `*[_type == "article" && status == "published" && featured == true] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage,
    "author": author->{name, slug},
    "categories": categories[]->{title, slug, color}
  }`,

  // Get all episodes
  episodes: `*[_type == "episode"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    episodeNumber,
    description,
    publishedAt,
    coverImage,
    audioUrl,
    duration,
    "hosts": hosts[]->{name, slug, image},
    youtubeUrl
  }`,

  // Get single episode by slug
  episodeBySlug: (slug: string) => `*[_type == "episode" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    episodeNumber,
    description,
    publishedAt,
    coverImage,
    audioUrl,
    duration,
    showNotes,
    timestamps,
    "hosts": hosts[]->{name, slug, image, bio, social},
    guests,
    youtubeUrl,
    spreakerId
  }`,

  // Get all authors
  authors: `*[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    image,
    bio,
    role,
    social
  }`,

  // Get site settings
  siteSettings: `*[_type == "siteSettings"][0] {
    title,
    description,
    logo,
    social,
    newsletter
  }`,
}
// lib/sanity/client.ts
import { createClient } from 'next-sanity';

// Public-safe defaults (projectId/dataset are not secrets)
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  'lvyw4h7w';

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production';

const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01';

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // fast, published content
  perspective: 'published' as const,
  token: process.env.SANITY_READ_TOKEN, // optional
};

const _client = createClient(sanityConfig);

// Export a getter so we can change config later if needed
export const getClient = () => _client;

/**
 * Centralize your GROQ here. These keys should match what your pages import.
 */
export const queries = {
  // list pages
  articles: `*[_type == "article"] | order(_createdAt desc){ _id, title, dek, slug, _createdAt }`,
  featuredArticles: `*[_type == "article" && defined(featured) && featured == true]{ _id, title, dek, slug, _createdAt }`,
  episodes: `*[_type == "episode"] | order(_createdAt desc){ _id, title, slug, _createdAt }`,

  // detail fetchers
  articleBySlug: (slug: string) =>
    `*[_type == "article" && slug.current == "${slug}"][0]{ _id, title, dek, slug, _createdAt, body }`,
  episodeBySlug: (slug: string) =>
    `*[_type == "episode" && slug.current == "${slug}"][0]{ _id, title, slug, _createdAt, body }`,

  // misc
  authors: `*[_type == "author"]{ _id, name, slug }`,
  siteSettings: `*[_type == "siteSettings"][0]`,
};
