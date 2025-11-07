export type Topic = "nba" | "lakers" | "podcast" | "video" | "tech" | "entertainment";

export const AccentColors: Record<Topic, { primary: string; secondary: string; ring: string; glow: string }> = {
  nba: {
    primary: "#FF6B35",
    secondary: "#DC2626",
    ring: "ring-orange-500/40 hover:ring-orange-400/60",
    glow: "group-hover:shadow-orange-500/20",
  },
  lakers: {
    primary: "#552583",
    secondary: "#FDB927",
    ring: "ring-purple-500/40 hover:ring-yellow-400/60",
    glow: "group-hover:shadow-purple-500/20",
  },
  podcast: {
    primary: "#06B6D4",
    secondary: "#8B5CF6",
    ring: "ring-teal-500/40 hover:ring-teal-400/60",
    glow: "group-hover:shadow-teal-500/20",
  },
  video: {
    primary: "#EF4444",
    secondary: "#F97316",
    ring: "ring-red-500/40 hover:ring-red-400/60",
    glow: "group-hover:shadow-red-500/20",
  },
  tech: {
    primary: "#3B82F6",
    secondary: "#10B981",
    ring: "ring-blue-500/40 hover:ring-blue-400/60",
    glow: "group-hover:shadow-blue-500/20",
  },
  entertainment: {
    primary: "#EC4899",
    secondary: "#F59E0B",
    ring: "ring-pink-500/40 hover:ring-pink-400/60",
    glow: "group-hover:shadow-pink-500/20",
  },
};

export function detectTopic(data: {
  title?: string;
  content_type?: string;
  source?: string;
  excerpt?: string;
}): Topic {
  const title = (data.title || "").toLowerCase();
  const source = (data.source || "").toLowerCase();
  const excerpt = (data.excerpt || "").toLowerCase();
  const contentType = (data.content_type || "").toLowerCase();
  
  const text = `${title} ${source} ${excerpt} ${contentType}`;

  if (contentType.includes("video") || contentType.includes("clip")) {
    return "video";
  }

  if (contentType.includes("podcast") || contentType.includes("episode") || title.includes("episode") || title.includes("podcast")) {
    return "podcast";
  }

  if (title.includes("lakers") || source.includes("lakers") || text.includes("lebron") || text.includes("anthony davis")) {
    return "lakers";
  }

  if (text.includes("tech") || text.includes("ai ") || text.includes("google") || text.includes("apple") || text.includes("meta") || text.includes("openai") || text.includes("microsoft") || text.includes("software") || text.includes("startup")) {
    return "tech";
  }

  if (text.includes("movie") || text.includes("tv ") || text.includes("box office") || text.includes("celebrity") || text.includes("entertainment") || text.includes("hollywood") || text.includes("music")) {
    return "entertainment";
  }

  return "nba";
}

export function getCategoryBadge(topic: Topic): { icon: string; label: string } {
  const badges = {
    nba: { icon: "🏀", label: "NBA" },
    lakers: { icon: "💜", label: "Lakers" },
    podcast: { icon: "🎙️", label: "Podcast" },
    video: { icon: "🎬", label: "Video" },
    tech: { icon: "⚡", label: "Tech" },
    entertainment: { icon: "🎭", label: "Entertainment" },
  };
  return badges[topic];
}
