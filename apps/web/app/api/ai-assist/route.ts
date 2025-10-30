import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import { supabaseServiceClient } from "../../../src/lib/supabase/client";

export const runtime = "nodejs";

const ACTION_PROMPTS: Record<string, string> = {
  summarize: "Provide a concise 2-3 sentence summary of the document.",
  seo: "Provide a 155 character SEO description.",
  related: "Suggest three related post titles as a JSON array.",
  x_thread: "Write an 8-10 tweet thread with numbered tweets.",
  ig_caption: "Write an Instagram caption with 5-7 relevant hashtags."
};

const loadGuidelines = async () => {
  try {
    return await fs.readFile("rules/ai_guidelines.md", "utf8");
  } catch (error) {
    return "You are LNLS Bot, an editorial assistant.";
  }
};

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ message: "AI disabled" }, { status: 200 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const doc = body?.doc;

  if (!action || !ACTION_PROMPTS[action]) {
    return NextResponse.json({ message: "Unsupported action" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const guidelines = await loadGuidelines();
  const content = JSON.stringify(doc ?? {});

  const completion = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 600,
    temperature: 0.3,
    system: guidelines,
    messages: [
      {
        role: "user",
        content: `${ACTION_PROMPTS[action]} Return JSON with keys: action, result. Document: ${content}`
      }
    ]
  });

  const text = completion.content?.[0]?.text ?? "";
  let payload: any;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    payload = { action, result: text };
  }

  if (doc?.slug) {
    const supabase = supabaseServiceClient();
    if (supabase && ["x_thread", "ig_caption"].includes(action)) {
      await supabase.from("social_captions").upsert({
        doc_type: doc.type ?? "article",
        doc_id: doc.slug,
        x_thread: action === "x_thread" ? payload.result : undefined,
        ig_caption: action === "ig_caption" ? payload.result : undefined
      }, { onConflict: "doc_id" });
    }
  }

  return NextResponse.json({ action, result: payload.result });
}
