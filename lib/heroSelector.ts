import type { PodcastEpisode } from "./podcast/spreaker";

type ContentItem = {
  id: string;
  title: string;
  excerpt?: string;
  image_url?: string | null;
  content_type?: string;
  source?: string;
  source_url?: string | null;
  published_at?: string | null;
};

type HeroCandidate =
  | { type: "podcast"; data: PodcastEpisode }
  | { type: "video"; data: ContentItem }
  | { type: "article"; data: ContentItem };

type HeroResult = {
  box1: HeroCandidate | null;
  box2: HeroCandidate | null;
  reason: string;
  candidates: Array<{
    type: string;
    title: string;
    published_at: string;
    selected: boolean;
    reason: string;
  }>;
};

/**
 * Selects Box 1 and Box 2 content based on deterministic rules:
 * 
 * Box 1: Newest of (Podcast Episode OR YouTube Video)
 * Box 2: The other one (whichever didn't win Box 1)
 * 
 * Returns observable decision metadata for debugging.
 */
export function selectHero(input: {
  podcast: PodcastEpisode | null;
  video: ContentItem | null;
}): HeroResult {
  const { podcast, video } = input;

  const candidates: HeroResult["candidates"] = [];

  // Build candidate list
  if (podcast) {
    candidates.push({
      type: "podcast",
      title: podcast.title,
      published_at: podcast.published_at,
      selected: false,
      reason: "",
    });
  }

  if (video) {
    candidates.push({
      type: "video",
      title: video.title,
      published_at: video.published_at || new Date(0).toISOString(),
      selected: false,
      reason: "",
    });
  }

  // No candidates → empty result
  if (candidates.length === 0) {
    return {
      box1: null,
      box2: null,
      reason: "No podcast or video available",
      candidates: [],
    };
  }

  // Only one candidate → Box 1 gets it, Box 2 is empty
  if (candidates.length === 1) {
    const single = candidates[0];
    single.selected = true;
    single.reason = "Only candidate available";

    return {
      box1: single.type === "podcast" 
        ? { type: "podcast", data: podcast! }
        : { type: "video", data: video! },
      box2: null,
      reason: `Only ${single.type} available`,
      candidates,
    };
  }

  // Both podcast and video exist → compare timestamps
  const podcastTime = podcast ? new Date(podcast.published_at).getTime() : 0;
  const videoTime = video?.published_at
    ? new Date(video.published_at).getTime()
    : 0;

  let box1: HeroCandidate;
  let box2: HeroCandidate;
  let reason: string;

  if (podcastTime > videoTime) {
    // Podcast is newer
    box1 = { type: "podcast", data: podcast! };
    box2 = { type: "video", data: video! };
    reason = `Podcast (${podcast!.published_at}) is newer than video (${video?.published_at})`;
    
    candidates[0].selected = true;
    candidates[0].reason = "Box 1: Newest content";
    candidates[1].reason = "Box 2: Second newest";
  } else {
    // Video is newer or equal
    box1 = { type: "video", data: video! };
    box2 = { type: "podcast", data: podcast! };
    reason = `Video (${video?.published_at}) is newer than or equal to podcast (${podcast!.published_at})`;
    
    candidates[1].selected = true;
    candidates[1].reason = "Box 1: Newest content";
    candidates[0].reason = "Box 2: Second newest";
  }

  return { box1, box2, reason, candidates };
}

/**
 * Helper to check if content is a YouTube URL
 */
export function isYouTube(url?: string | null): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes("youtube.com/") || u.includes("youtu.be/");
}