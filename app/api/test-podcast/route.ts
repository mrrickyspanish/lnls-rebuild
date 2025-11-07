import { fetchSpreaker } from "@/lib/podcast/spreaker";

export async function GET() {
  try {
    const episodes = await fetchSpreaker();
    return Response.json({
      success: true,
      count: episodes.length,
      episodes: episodes.slice(0, 3), // First 3 episodes
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
