import groq from "groq";

export const homePageQuery = groq`
{
  "featuredArticle": *[_type == "article" && meta.status == "published" && visibility == "public"] | order(publishAt desc)[0]{
    _id,
    title,
    "slug": slug.current,
    dek,
    heroImage
  },
  "latestVideos": *[_type == "video" && visibility == "public"] | order(publishedAt desc)[0..3]{
    _id,
    title,
    youtubeId,
    publishedAt
  },
  "latestEpisodes": *[_type == "podEpisode" && visibility == "public"] | order(publishedAt desc)[0..3]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    audioUrl,
    duration
  }
}`;

export const articleBySlugQuery = groq`
*[_type == "article" && slug.current == $slug][0]{
  ...,
  author->{name, "slug": slug.current},
  coAuthors[]->{name, "slug": slug.current},
  tags[]->{name, "slug": slug.current},
  teams[]->{name, "slug": slug.current},
  players[]->{fullName, "slug": slug.current}
}`;

export const articlesListingQuery = groq`
*[_type == "article" && visibility == "public"] | order(publishAt desc){
  _id,
  title,
  dek,
  publishAt,
  slug,
  tags[]->{name, "slug": slug.current}
}`;

export const podcastEpisodeBySlugQuery = groq`
*[_type == "podEpisode" && slug.current == $slug][0]{
  ...,
  guests,
  youtubeId
}`;

export const podcastListingQuery = groq`
*[_type == "podEpisode" && visibility == "public"] | order(publishedAt desc){
  _id,
  title,
  slug,
  audioUrl,
  duration,
  publishedAt
}`;

export const videoGridQuery = groq`
*[_type == "video" && visibility == "public"] | order(publishedAt desc){
  _id,
  title,
  youtubeId,
  publishedAt,
  description
}`;

export const videoBySlugQuery = groq`
*[_type == "video" && slug.current == $slug][0]{
  ...
}`;
