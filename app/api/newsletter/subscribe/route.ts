import { BRAND_NAME, EMAIL_REPLY_TO, emailFrom, sendOrThrow } from "@/lib/email";
import { SITE_OWNER } from "@/lib/author";
// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";
import { Resend } from "resend";
import { subscribeToNewsletter } from "@/lib/supabase/client";
import { LANES, isLaneKey } from "@/lib/topics";

const resendApiKey = process.env.RESEND_API_KEY;
// Constructed on first use. `new Resend(undefined)` throws at import time, so
// building without RESEND_API_KEY failed while collecting page data even
// though the guards below never send mail without a key.
let resendClient: Resend | null = null
function resend(): Resend {
  if (!resendClient) resendClient = new Resend(resendApiKey)
  return resendClient
}

/**
 * Minimal email check; keep server-only logic here.
 */
function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email, lanes: picked } = (await request.json()) as { email?: string; lanes?: unknown };

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Lane picks. None sent, or all four, means every lane (stored as NULL).
    // "home" was the Life lane's first name; accept it from any old page.
    const lanes = Array.isArray(picked)
      ? [...new Set(picked.map((lane) => (lane === "home" ? "life" : lane)).filter(isLaneKey))]
      : null;
    if (Array.isArray(picked) && lanes && lanes.length === 0) {
      return NextResponse.json({ error: "Pick at least one lane" }, { status: 400 });
    }
    const storedLanes = lanes && lanes.length < LANES.length ? lanes : null;

    const {
      data,
      error,
    }: { data: unknown; error: PostgrestError | null } = await subscribeToNewsletter(email, "site", storedLanes);

    if (error) {
      // 23505 = unique_violation in Postgres
      if (error.code === "23505" || /duplicate/i.test(error.message)) {
        return NextResponse.json({ error: "Email already subscribed" }, { status: 409 });
      }
      console.error("newsletter insert error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
    }

    // Send welcome email (best-effort; do not fail subscription if email send errors)
    if (resendApiKey) {
      try {
        await sendOrThrow(resend(), {
          from: emailFrom(),
          replyTo: EMAIL_REPLY_TO,
          to: email,
          subject: `Welcome to ${BRAND_NAME}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6">
              <h1>Welcome to ${BRAND_NAME}</h1>
              <p>Thanks for subscribing. You'll get my new pieces as I publish them: sports, tech, culture, and life at home.</p>
              <p>${SITE_OWNER.name}<br>${BRAND_NAME}</p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.warn("Resend send error (non-fatal):", mailErr);
        // continue; don't block successful subscription
      }
    } else {
      console.warn("RESEND_API_KEY missing; skipping welcome email.");
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
    console.error("Newsletter subscription route crash:", msg);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
