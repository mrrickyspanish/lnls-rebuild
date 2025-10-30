import { z } from "zod";

export const slugSchema = z.object({
  current: z.string().min(1)
});

export const referenceSchema = z.object({
  _ref: z.string(),
  _type: z.literal("reference")
});

export const imageSchema = z.object({
  _type: z.literal("image"),
  asset: referenceSchema.optional(),
  alt: z.string().optional()
});

export const portableTextSchema = z.array(z.unknown());

export const metaStateSchema = z.object({
  status: z.enum(["draft", "inReview", "approved", "scheduled", "published"]).default("draft"),
  approvedBy: z.string().optional(),
  scheduledAt: z.string().optional(),
  lastReviewedAt: z.string().optional()
});

export const visibilitySchema = z.enum(["public", "private"]);

export const siteSettingsSchema = z.object({
  siteName: z.string(),
  tagline: z.string().optional(),
  contactEmail: z.string().email().optional(),
  socials: z.record(z.string()).optional(),
  podcastOwnerEmail: z.string().email().optional(),
  rssSource: z.string().url().optional()
});

export const authorSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: slugSchema,
  avatar: imageSchema.optional(),
  bio: portableTextSchema.optional(),
  socials: z.record(z.string()).optional(),
  email: z.string().email().optional()
});

export const tagSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: slugSchema
});

export const teamSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: slugSchema,
  abbreviation: z.string().optional(),
  colors: z.array(z.string()).optional()
});

export const playerSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  slug: slugSchema,
  team: referenceSchema.optional()
});

export const seriesSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: slugSchema
});

export const articleSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: slugSchema,
  dek: z.string().optional(),
  heroImage: imageSchema.optional(),
  body: portableTextSchema,
  author: referenceSchema.optional(),
  coAuthors: z.array(referenceSchema).optional(),
  tags: z.array(referenceSchema).optional(),
  teams: z.array(referenceSchema).optional(),
  players: z.array(referenceSchema).optional(),
  series: referenceSchema.optional(),
  publishAt: z.string().optional(),
  seo: z.record(z.unknown()).optional(),
  meta: metaStateSchema,
  visibility: visibilitySchema
});

export const gameDaySchema = z.object({
  _id: z.string(),
  opponentTeam: referenceSchema,
  gameDateTime: z.string(),
  venue: z.string().optional(),
  tv: z.string().optional(),
  radio: z.string().optional(),
  bettingLine: z.string().optional(),
  injuries: portableTextSchema.optional(),
  preview: portableTextSchema.optional(),
  recapUrl: z.string().url().optional(),
  status: z.string().optional()
});

export const podcastEpisodeSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: slugSchema,
  episodeNumber: z.number().optional(),
  audioUrl: z.string().url().optional(),
  duration: z.string().optional(),
  publishedAt: z.string().optional(),
  showNotes: portableTextSchema.optional(),
  guests: z.array(z.string()).optional(),
  youtubeId: z.string().optional(),
  externalGuid: z.string().optional(),
  meta: metaStateSchema.optional(),
  visibility: visibilitySchema.optional()
});

export const videoSchema = z.object({
  _id: z.string(),
  youtubeId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  playlist: z.string().optional(),
  publishedAt: z.string().optional(),
  tags: z.array(referenceSchema).optional(),
  teams: z.array(referenceSchema).optional(),
  meta: metaStateSchema.optional(),
  visibility: visibilitySchema.optional()
});

export type Article = z.infer<typeof articleSchema>;
export type PodcastEpisode = z.infer<typeof podcastEpisodeSchema>;
export type Video = z.infer<typeof videoSchema>;
export type GameDay = z.infer<typeof gameDaySchema>;
