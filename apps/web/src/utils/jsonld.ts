export const articleJsonLd = ({
  title,
  slug,
  publishAt
}: {
  title: string;
  slug: string;
  publishAt?: string | null;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  datePublished: publishAt ?? undefined,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://latenightlakeshow.com"}/articles/${slug}`
  }
});

export const podcastJsonLd = ({
  title,
  slug,
  publishAt
}: {
  title: string;
  slug: string;
  publishAt?: string | null;
}) => ({
  "@context": "https://schema.org",
  "@type": "PodcastEpisode",
  name: title,
  datePublished: publishAt ?? undefined,
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://latenightlakeshow.com"}/podcast/${slug}`
});

export const videoJsonLd = ({
  title,
  youtubeId,
  publishAt
}: {
  title: string;
  youtubeId: string;
  publishAt?: string | null;
}) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: title,
  uploadDate: publishAt ?? undefined,
  contentUrl: `https://youtu.be/${youtubeId}`
});
