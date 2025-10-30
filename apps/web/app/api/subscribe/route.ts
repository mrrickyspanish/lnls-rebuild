import { NextResponse } from "next/server";
import { supabaseClient } from "../../../src/lib/supabase/client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const supabase = supabaseClient();
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString().toLowerCase();
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ message: "Subscription offline" }, { status: 200 });
  }

  const { error } = await supabase.from("newsletter_subs").upsert({ email }, { onConflict: "email" });
  if (error) {
    return NextResponse.json({ message: "Unable to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
