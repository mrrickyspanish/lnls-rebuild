// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";
import { Resend } from "resend";
import { subscribeToNewsletter } from "@/lib/supabase/client";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

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
      console.error("newsletter insert error:", error);
      return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
    }

    // Send welcome email (best-effort; do not fail subscription if email send errors)
    if (resendApiKey) {
      try {
        await resend.emails.send({
          from: "LNLS <newsletter@lnls.media>",
          to: email,
          subject: "Welcome to LNLS!",
          html: `
            <h1>Welcome to Late Night Lake Show!</h1>
            <p>Thanks for subscribing. You'll now get the latest Lakers news and LNLS updates.</p>
            <p>— The LNLS Team</p>
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
