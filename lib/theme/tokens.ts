export type TopicType = "lakers" | "nba" | "podcast" | "video" | "article" | "general" | "recruit ready";

export const AccentColors = {
  lakers: { primary: "#FDB927", secondary: "#552583" }, // Lakers gold & purple
  nba: { primary: "#FF6B35", secondary: "#004225" },     // NBA orange & green
  podcast: { primary: "#1DB954", secondary: "#191414" }, // Spotify green
  video: { primary: "#FF0000", secondary: "#282828" },   // YouTube red
  article: { primary: "#0070F3", secondary: "#F5F5F5" }, // Blue
  general: { primary: "#8B5CF6", secondary: "#1F2937" }, // Purple
  "recruit ready": { primary: "#10B981", secondary: "#064E3B" }, // Green
};

export function detectTopic(item: any): TopicType {
  const title = item.title?.toLowerCase() || "";
  const source = item.source?.toLowerCase() || "";
  
  if (item.content_type === "podcast") return "podcast";
  if (item.content_type === "video") return "video";
  if (title.includes("laker") || source.includes("laker")) return "lakers";
  if (title.includes("nba")) return "nba";
  if (item.content_type === "article") return "article";
  
  return "general";
}

export function getCategoryBadge(topic: TopicType) {
  const badges = {
    lakers: { label: "Lakers", icon: "🏀" },
    nba: { label: "NBA", icon: "🏆" },
    podcast: { label: "Podcast", icon: "🎙️" },
    video: { label: "Video", icon: "📺" },
    article: { label: "Article", icon: "📰" },
    general: { label: "News", icon: "📢" },
    "recruit ready": { label: "Recruit Ready", icon: "⭐" },
  };
  
  return badges[topic] || badges.general;
}