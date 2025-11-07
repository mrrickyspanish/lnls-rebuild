import { fetchSpreaker } from "@/lib/podcast/spreaker";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const episodes = await fetchSpreaker();
    return NextResponse.json({
      success: true,
      episodes,
    });
  } catch (error: any) {
    console.error('Error fetching Spreaker:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
