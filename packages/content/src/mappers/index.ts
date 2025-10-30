import type { Article, PodcastEpisode, Video } from "../schemas";

export type SanityImage = {
  asset?: { _ref?: string };
  alt?: string;
};

export const mapArticle = (doc: Article) => ({
  id: doc._id,
  title: doc.title,
  slug: doc.slug.current,
  dek: doc.dek ?? "",
  heroImage: doc.heroImage as SanityImage | undefined,
  publishAt: doc.publishAt ?? null,
  visibility: doc.visibility,
  meta: doc.meta,
  tags: doc.tags,
  teams: doc.teams,
  players: doc.players
});

export const mapPodcastEpisode = (doc: PodcastEpisode) => ({
  id: doc._id,
  title: doc.title,
  slug: doc.slug.current,
  audioUrl: doc.audioUrl ?? null,
  duration: doc.duration ?? null,
  publishedAt: doc.publishedAt ?? null,
  guests: doc.guests ?? [],
  youtubeId: doc.youtubeId ?? null,
  showNotes: doc.showNotes ?? null
});

export const mapVideo = (doc: Video) => ({
  id: doc._id,
  title: doc.title,
  youtubeId: doc.youtubeId,
  description: doc.description ?? "",
  publishedAt: doc.publishedAt ?? null,
  playlist: doc.playlist ?? null
});
