import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sanityClient } from "../../../../src/lib/sanity/client";

export const runtime = "nodejs";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE;
  if (!apiKey || !handle) {
    return NextResponse.json({ message: "YouTube env missing", inserted: 0 }, { status: 200 });
  }

  const client = sanityClient();
  if (!client) {
    return NextResponse.json({ message: "Sanity offline", inserted: 0 }, { status: 200 });
  }

  const channelRes = await fetch(`${YOUTUBE_API}/channels?part=id&forHandle=${handle}&key=${apiKey}`);
  const channelData = await channelRes.json();
  const channelId = channelData?.items?.[0]?.id;
  if (!channelId) {
    return NextResponse.json({ message: "Channel not found", inserted: 0 }, { status: 200 });
  }

  const searchRes = await fetch(
    `${YOUTUBE_API}/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`
  );
  const searchData = await searchRes.json();

  let inserted = 0;
  for (const item of searchData?.items ?? []) {
    const videoId = item?.id?.videoId;
    if (!videoId) continue;
    const snippet = item.snippet;
    await client.createOrReplace({
      _id: `video-${videoId}`,
      _type: "video",
      youtubeId: videoId,
      title: snippet?.title ?? "Untitled Video",
      description: snippet?.description ?? "",
      publishedAt: snippet?.publishedAt ?? null,
      visibility: "public",
      meta: { status: "published" }
    });
    inserted += 1;
  }

  revalidatePath("/videos");
  revalidatePath("/");
  return NextResponse.json({ inserted });
}
