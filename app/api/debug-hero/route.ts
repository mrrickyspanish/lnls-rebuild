import { NextResponse } from "next/server";
import { getLatestEpisode } from "@/lib/podcast/spreaker";
import { selectHero, isYouTube } from "@/lib/heroSelector";
import { getNewsStream } from "@/lib/supabase/client";
import { client } from "@/sanity/lib/client";

export const revalidate = 0; // Always fresh for debugging

export async function GET() {
  try {
    const supabaseData = await getNewsStream(30);

    const [articles, episodes, clips, latestPodcast] = await Promise.all([
      client.fetch(
        `*[_type == "article"] | order(publishedAt desc)[0...15]{
          _id,_type,title,slug,excerpt,
          "mainImage": mainImage.asset->url,
          publishedAt,source,externalUrl
        }`
      ),
      client.fetch(
        `*[_type == "episode"] | order(publishedAt desc)[0...10]{
          _id,_type,title,slug,excerpt,
          "mainImage": mainImage.asset->url,
          publishedAt,source
        }`
      ),
      client.fetch(
        `*[_type == "clip"] | order(publishedAt desc)[0...10]{
          _id,_type,title,videoUrl,thumbnailUrl,
          publishedAt,source
        }`
      ),
      getLatestEpisode(),
    ]);

    const supabaseItems = (supabaseData || []).map((item: any) => ({
      id: String(item.id),
      title: item.title,
      content_type: item.content_type || "article",
      source: item.source || undefined,
      source_url: item.source_url || null,
      published_at: item.published_at || null,
    }));

    const sanityItems = [...articles, ...episodes, ...clips].map((item: any) => {
      let content_type: "article" | "podcast" | "video" = "article";
      if (item._type === "episode") content_type = "podcast";
      if (item._type === "clip") content_type = "video";

      return {
        id: item._id,
        title: item.title,
        content_type,
        source: item.source || "LNLS",
        source_url:
          item.externalUrl ||
          item.videoUrl ||
          (item.slug ? `/news/${item.slug.current}` : null),
        published_at: item.publishedAt || null,
      };
    });

    const merged = [...supabaseItems, ...sanityItems].sort((a, b) => {
      const da = a.published_at ? new Date(a.published_at).getTime() : 0;
      const db = b.published_at ? new Date(b.published_at).getTime() : 0;
      return db - da;
    });

    const latestVideo = merged.find((x) => {
      const ct = (x.content_type || "").toLowerCase();
      return ct === "video" || isYouTube(x.source_url);
    });

    const heroSelection = selectHero({
      podcast: latestPodcast,
      video: latestVideo || null,
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      box1: heroSelection.box1
        ? {
            type: heroSelection.box1.type,
            title: heroSelection.box1.data.title,
            published_at:
              heroSelection.box1.type === "podcast"
                ? heroSelection.box1.data.published_at
                : heroSelection.box1.data.published_at,
          }
        : null,
      box2: heroSelection.box2
        ? {
            type: heroSelection.box2.type,
            title: heroSelection.box2.data.title,
            published_at:
              heroSelection.box2.type === "podcast"
                ? heroSelection.box2.data.published_at
                : heroSelection.box2.data.published_at,
          }
        : null,
      reason: heroSelection.reason,
      candidates: heroSelection.candidates,
      inputs: {
        podcast: latestPodcast
          ? {
              title: latestPodcast.title,
              published_at: latestPodcast.published_at,
              episode_number: latestPodcast.episode_number,
            }
          : null,
        video: latestVideo
          ? {
              title: latestVideo.title,
              published_at: latestVideo.published_at,
              source: latestVideo.source,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Debug hero error:", error);
    return NextResponse.json(
      {
        error: "Failed to debug hero selection",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}