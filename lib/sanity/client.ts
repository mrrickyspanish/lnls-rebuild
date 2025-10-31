// lib/sanity/client.ts
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

/**
 * Env + safe fallbacks (projectId/dataset are NOT secrets).
 * Put real values in Vercel:
 *  - NEXT_PUBLIC_SANITY_PROJECT_ID = lvyw4h7w
 *  - NEXT_PUBLIC_SANITY_DATASET   = production
 *  - SANITY_API_VERSION           = 2025-01-01 (or your date)
 *  - SANITY_READ_TOKEN            = (optional)
 */
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "lvyw4h7w";

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";

const apiVersion = process.env.SANITY_API_VERSION || "2025-01-01";

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // published content via CDN
  perspective: "published" as const,
  token: process.env.SANITY_READ_TOKEN, // optional (for drafts/private)
};

// Singleton read client
const _client = createClient(sanityConfig);
export const getClient = () => _client;

// (Optional) write client if you ever need mutations
export const getWriteClient = () =>
  createClient({
    ...sanityConfig,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN || process.env.SANITY_READ_TOKEN,
  });

// Image helper
const builder = imageUrlBuilder({
  projectId,
  dataset,
});
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * GROQ queries
 * Note: we alias `dek` to `excerpt` if needed, and include both `publishedAt` and `_createdAt`
 * so your pages/components don’t break regardless of which field they read.
 */
export const queries = {
  // List articles
  articles: `
    *[_type == "article" && (!defined(status) || status == "published")]
    | order(coalesce(publishedAt, _createdAt) desc) {
      _id,
      title,
      "dek": coalesce(excerpt, seo.description),
      slug,
      publishedAt,
      _createdAt,
      mainImage,
      "author": author->{name, slug, image},
      "categories": categories[]->{title, slug, color},
      featured
    }
  `,

  // One article by slug
  articleBySlug: (slug: string) => `
    *[_type == "article" && slug.current == "${slug}"][0]{
      _id,
      title,
      "dek": coalesce(excerpt, seo.description),
      slug,
      publishedAt,
      _createdAt,
      mainImage,
      body,
      "author": author->{name, slug, image, bio, role, social},
      "categories": categories[]->{title, slug, color},
      seo,
      aiGenerated
    }
  `,

  // Featured
  featuredArticles: `
    *[_type == "article" && (!defined(status) || status == "published") && defined(featured) && featured == true]
    | order(coalesce(publishedAt, _createdAt) desc)[0...3]{
      _id, title, "dek": coalesce(excerpt, seo.description), slug, publishedAt, _createdAt,
      mainImage,
      "author": author->{name, slug},
      "categories": categories[]->{title, slug, color}
    }
  `,

  // Episodes list (include common fields so LatestEpisodes has what it needs)
  episodes: `
    *[_type == "episode"] | order(coalesce(publishedAt, _createdAt) desc) {
      _id,
      title,
      slug,
      episodeNumber,
      description,
      publishedAt,
      _createdAt,
      coverImage,
      audioUrl,
      duration,
      youtubeUrl,
      "hosts": hosts[]->{name, slug, image}
    }
  `,

  // One episode by slug
  episodeBySlug: (slug: string) => `
    *[_type == "episode" && slug.current == "${slug}"][0]{
      _id,
      title,
      slug,
      episodeNumber,
      description,
      publishedAt,
      _createdAt,
      coverImage,
      audioUrl,
      duration,
      showNotes,
      timestamps,
      "hosts": hosts[]->{name, slug, image, bio, social},
      guests,
      youtubeUrl,
      spreakerId
    }
  `,

  authors: `
    *[_type == "author"] | order(name asc) {
      _id, name, slug, image, bio, role, social
    }
  `,

  siteSettings: `
    *[_type == "siteSettings"][0] {
      title, description, logo, social, newsletter
    }
  `,
};
