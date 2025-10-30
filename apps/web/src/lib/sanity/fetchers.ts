import { mapArticle, mapPodcastEpisode, mapVideo } from "@lnls/content/mappers";
import {
  articleBySlugQuery,
  articlesListingQuery,
  homePageQuery,
  podcastEpisodeBySlugQuery,
  podcastListingQuery,
  videoBySlugQuery,
  videoGridQuery
} from "@lnls/content/queries";
import type { Article, PodcastEpisode, Video } from "@lnls/content/schemas";
import { sanityClient } from "./client";

export const fetchHomeContent = async () => {
  const client = sanityClient();
  if (!client) {
    return {
      featuredArticle: null,
      latestVideos: [],
      latestEpisodes: []
    };
  }

  const data = await client.fetch<{
    featuredArticle: Article | null;
    latestVideos: Video[];
    latestEpisodes: PodcastEpisode[];
  }>(homePageQuery);

  return {
    featuredArticle: data.featuredArticle ? mapArticle(data.featuredArticle) : null,
    latestVideos: data.latestVideos?.map(mapVideo) ?? [],
    latestEpisodes: data.latestEpisodes?.map(mapPodcastEpisode) ?? []
  };
};

export const fetchArticleBySlug = async (slug: string) => {
  const client = sanityClient();
  if (!client) return null;
  const article = await client.fetch<Article | null>(articleBySlugQuery, { slug });
  return article ? mapArticle(article) : null;
};

export const fetchArticleDetail = async (slug: string) => {
  const client = sanityClient();
  if (!client) return null;
  return client.fetch<Article | null>(articleBySlugQuery, { slug });
};

export const fetchPodcastEpisodeBySlug = async (slug: string) => {
  const client = sanityClient();
  if (!client) return null;
  const episode = await client.fetch<PodcastEpisode | null>(podcastEpisodeBySlugQuery, { slug });
  return episode ? mapPodcastEpisode(episode) : null;
};

export const fetchVideoGrid = async () => {
  const client = sanityClient();
  if (!client) return [];
  const videos = await client.fetch<Video[]>(videoGridQuery);
  return videos.map(mapVideo);
};

export const fetchArticles = async () => {
  const client = sanityClient();
  if (!client) return [];
  const articles = await client.fetch<Article[]>(articlesListingQuery);
  return articles.map(mapArticle);
};

export const fetchPodcastEpisodes = async () => {
  const client = sanityClient();
  if (!client) return [];
  const episodes = await client.fetch<PodcastEpisode[]>(podcastListingQuery);
  return episodes.map(mapPodcastEpisode);
};

export const fetchVideoBySlug = async (slug: string) => {
  const client = sanityClient();
  if (!client) return null;
  const video = await client.fetch<Video | null>(videoBySlugQuery, { slug });
  return video ? mapVideo(video) : null;
};
