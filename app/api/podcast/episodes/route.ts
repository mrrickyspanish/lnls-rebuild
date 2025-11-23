import { NextResponse } from "next/server";
import { fetchPodcastEpisodes } from "@/lib/podcast";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  const episodes = await fetchPodcastEpisodes();
  return NextResponse.json(episodes);
}