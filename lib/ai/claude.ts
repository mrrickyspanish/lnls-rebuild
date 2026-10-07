import Anthropic from '@anthropic-ai/sdk'

/**
 * The one place the site talks to Claude. Every AI feature (AI Auto-Format in
 * the article editor, and the helpers in app/api/ai/assist and lib/ai) goes
 * through askClaude, so the model, the refusal handling and the fallback
 * setting live here and nowhere else.
 *
 * Model: Claude Opus 5.5, the current Opus. It replaced Claude Sonnet 4
 * (claude-sonnet-4-20250514), which Anthropic has deprecated. Differences that
 * shaped this code:
 * - Thinking is always on and counts toward max_tokens, so limits leave room
 *   for it. Effort is the speed/quality control; these are short, mechanical
 *   jobs (formatting, captions, summaries), so they default to "low".
 * - temperature/top_p/top_k are rejected (400), so none are sent.
 * - A response may start with thinking blocks; text is read by block type.
 */
export const CLAUDE_MODEL = 'claude-opus-5-5'

type Effort = 'low' | 'medium' | 'high'

type AskOptions = {
  /** Room for thinking plus the answer. */
  maxTokens?: number
  effort?: Effort
}

/** Claude's safety checks declined the request, and so did the fallback model. */
export class ClaudeRefusalError extends Error {}

/** The answer hit max_tokens and is incomplete. */
export class ClaudeTruncatedError extends Error {}

let client: Anthropic | null = null

// Built on first use, not at import: a missing ANTHROPIC_API_KEY then fails
// the one request that needs it instead of every route that imports this file.
function getClient(): Anthropic {
  client ??= new Anthropic()
  return client
}

export async function askClaude(prompt: string, { maxTokens = 16000, effort = 'low' }: AskOptions = {}): Promise<string> {
  // Streamed so a long answer can't hit the HTTP timeout; finalMessage()
  // waits for the whole thing.
  const message = await getClient()
    .beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      output_config: { effort },
      // If Claude's safety classifiers decline a request (rare for sports
      // copy, but false positives happen), Anthropic re-runs it on the model
      // it recommends for that kind of decline, in the same call.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: prompt }],
    })
    .finalMessage()

  if (message.stop_reason === 'refusal') {
    throw new ClaudeRefusalError('The AI declined this request. Try rewording it, or format the article by hand.')
  }
  if (message.stop_reason === 'max_tokens') {
    throw new ClaudeTruncatedError('The AI response was cut off before it finished. Try a shorter piece of text.')
  }

  // After a fallback the answer can arrive as more than one text block (the
  // part written before the switch, then the rest), so join them in order.
  return message.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
}
