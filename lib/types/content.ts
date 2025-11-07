export type ContentType =
  | "article"
  | "lakers"
  | "podcast"
  | "video"
  | "tech"
  | "entertainment";

export type CardItem = {
  id: string;
  title: string;
  source_url?: string | null;
  image_url?: string | null;
  content_type: ContentType;
  published_at?: string | null;
  source?: string | null;
};
