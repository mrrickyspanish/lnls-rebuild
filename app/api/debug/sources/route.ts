import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  try {
    const supa = getClient();

    const { count: total } = await supa.from("ai_news_stream").select("*", { count: "exact", head: true });
    const { count: yt }    = await supa.from("ai_news_stream").select("*", { count: "exact", head: true }).eq("source","YouTube");
    const { count: espn }  = await supa.from("ai_news_stream").select("*", { count: "exact", head: true }).eq("source","www.espn.com");

    const { data: withImg } = await supa
      .from("ai_news_stream")
      .select("title,source,source_url,image_url,published_at")
      .not("image_url","is",null)
      .order("published_at",{ascending:false})
      .limit(5);

    return NextResponse.json({ counts: { total, yt, espn }, sample_with_images: withImg ?? [] });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? "debug failed" }, { status: 500 });
  }
}
