import { BRAND_NAME, EMAIL_REPLY_TO, emailFrom, sendOrThrow } from "@/lib/email";
// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";
import { Resend } from "resend";
import { subscribeToNewsletter } from "@/lib/supabase/client";

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
    const { email } = (await request.json()) as { email?: string };

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Insert subscriber (ensure your helper returns PostgrestError | null)
    const {
      data,
      error,
    }: { data: unknown; error: PostgrestError | null } = await subscribeToNewsletter(email);

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
              <p>Thanks for subscribing. You'll get new stories as we publish them: sports, tech, and the culture around the game.</p>
              <p>${BRAND_NAME}</p>
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
