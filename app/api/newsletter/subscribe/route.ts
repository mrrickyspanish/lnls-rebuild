import { EMAIL_REPLY_TO, personalFrom, sendOrThrow } from "@/lib/email";
import { renderWelcomeEmail, unsubscribeUrl } from "@/lib/newsletter/email";
// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServiceClient, subscribeToNewsletter } from "@/lib/supabase/client";
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

    const { data, error, token: newToken } = await subscribeToNewsletter(email, "site", storedLanes);
    let token = newToken;

    if (error) {
      // 23505 = unique_violation in Postgres: the address is already on file.
      if (error.code === "23505" || /duplicate/i.test(error.message)) {
        const supabase = createSupabaseServiceClient();
        const { data: existing } = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .eq("email", email)
          .maybeSingle();
        const row = existing as { id: string; active?: boolean; unsubscribe_token?: string | null } | null;
        // Someone who unsubscribed and signs up again is welcomed back with
        // their new picks. It used to say "already subscribed" and leave them
        // unsubscribed.
        if (row && row.active === false) {
          token = row.unsubscribe_token || newToken;
          const { error: backError } = await supabase
            .from("newsletter_subscribers")
            .update({ active: true, unsubscribed_at: null, lanes: storedLanes, unsubscribe_token: token } as any)
            .eq("id", row.id);
          if (backError) {
            console.error("newsletter resubscribe error:", backError);
            return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
          }
        } else {
          return NextResponse.json(
            { error: "You're already on the list. To change what you get, use the link at the bottom of any email." },
            { status: 409 }
          );
        }
      } else {
        console.error("newsletter insert error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
      }
    }

    // Welcome email (best-effort; a failed send never fails the sign-up).
    if (resendApiKey) {
      try {
        const welcome = renderWelcomeEmail({ lanes: storedLanes, token });
        await sendOrThrow(resend(), {
          from: personalFrom(),
          replyTo: EMAIL_REPLY_TO,
          to: email,
          subject: welcome.subject,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl(token)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          html: welcome.html,
          text: welcome.text,
        });
      } catch (mailErr) {
        console.warn("Resend send error (non-fatal):", mailErr);
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
