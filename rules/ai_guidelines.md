# AI Guidelines

These guidelines define coding standards, editorial rules, and operational constraints for all AI-related features in LNLS Rebuild. They are binding for contributors and agents.

## Principles
- Safety and integrity over speed. Prefer conservative defaults and explicit human review steps.
- Deterministic, testable outputs where possible. Log prompts, versions, and parameters.
- Respect brand voice and editorial rules. Never publish unreviewed outputs directly to production.

## Coding Standards (AI Modules)
- Structure
  - Place AI utilities in `/lib/ai/` and prompts in `/lib/ai/prompts/`.
  - Encapsulate provider calls behind interfaces to enable provider failover.
  - Export pure functions where feasible; separate I/O (fetch, db) from transforms.
- Error handling
  - Always catch provider errors; return typed error objects and never throw across API boundaries.
  - Implement retries with exponential backoff and jitter. Max 3 retries.
  - Timeouts: 20s default per request; abort on timeout and log.
- Observability
  - Log model, temperature, max_tokens, provider, latency, and token usage per call.
  - Redact PII and secrets in logs.
  - Emit metrics: success_rate, error_rate, avg_latency, tokens_in/out.
- Testing
  - Add snapshot tests for prompt templates with deterministic seeds.
  - Provide mock providers for unit tests; no live keys in CI.
- Configuration
  - All keys in environment variables; never hardcode keys or org IDs.
  - Centralize model defaults in `/lib/ai/config.ts`.

## Editorial Rules
- Brand voice
  - Informed Lakers analysis, respectful tone, no profanity or personal attacks.
  - Avoid sensationalism; clearly distinguish rumors vs. confirmed reports.
- Factuality and sourcing
  - Cite original sources for news. Include links when available.
  - If uncertain, mark as “Unconfirmed” and route for human review.
- Style
  - American English, AP-style capitalization for headlines, sentence-case for body.
  - Use ISO timestamps for show notes, e.g., 00:12:34.
- SEO
  - Include descriptive titles (50–60 chars) and meta descriptions (140–160 chars).
  - Insert relevant keywords naturally; avoid keyword stuffing.

## Forbidden Actions
- Do not hard-code Lakers brand colors anywhere in AI prompts or code. Use theme tokens from the design system only.
- Do not push features beyond MVP scope without approval. Follow the MVP checklist in `/docs/architecture.md`.
- Do not manually import external content into the database or CMS outside the ingestion pipelines. Always use approved import scripts with logging.
- Do not auto-publish AI outputs to production without human approval states in Sanity.
- Do not exceed API rate/interval rules (see below).

## Preferred Models and Libraries
- Providers
  - Anthropic Claude (latest Sonnet/Opus) for long-form generation and summarization.
  - OpenAI GPT-4o/4.1-mini for classification, extraction, and caption variants.
- Libraries
  - Official SDKs where possible. Use fetch+typed clients if SDK not available.
  - OpenAI: `openai` npm, Anthropic: `@anthropic-ai/sdk`.
- Parameters (defaults)
  - temperature: 0.3 (summaries), 0.5 (captions), 0.2 (extraction)
  - max_tokens: sized to task; enforce upper bounds in config

## API Interval and Rate Rules
- Global rate limits
  - Max 60 requests/min per provider account unless provider quota allows more.
  - Burst control: queue requests above 5 concurrent per lambda/route.
- Backoff policy
  - 429/Rate limit: exponential backoff starting at 1s, multiplier 2, max delay 30s.
  - 5xx errors: up to 3 retries with jitter.
- Scheduling
  - RSS processing: every 30 minutes.
  - Social caption generation: on publish events; no more than 3 variants per platform per item.
  - YouTube -> Article: manual trigger or on video publish webhook; cap at 2 concurrent jobs.
  - Podcast notes: on episode publish; 1 job per episode.

## Prompting Standards
- Keep system prompts in versioned files with semantic headers (title, version, purpose).
- Include guardrails: content policy, brand voice, formatting requirements.
- Provide explicit JSON schemas for extraction tasks; validate before write.

## Human-in-the-Loop Requirements
- All AI-generated content must be created as Drafts in Sanity with status fields:
  - status: draft|review|approved|published
  - ai_generated: boolean
  - source: rss|youtube|podcast|manual
  - provenance: provider, model, prompt_version, created_at
- Publishing requires reviewer approval in Studio.

## Security and Compliance
- Never include API keys, cookies, or auth tokens in prompts.
- Strip PII from inputs before sending to providers.
- Respect robots.txt and site terms for all crawled sources.
- Maintain an allowlist of RSS domains in environment/config.

## Directory and File Conventions
- `/lib/ai/` code, `/lib/ai/prompts/` templates, `/lib/ai/types/` TypeScript types.
- `/pages/api/ai/*` or `/app/api/ai/*` for server routes. No AI calls from client components.
- `/scripts/` for ingestion jobs and cron tasks.

## Review Checklist (for PRs touching AI)
- [ ] No secrets in code or prompts
- [ ] Uses centralized config and preferred models
- [ ] Implements retries, timeouts, and logging
- [ ] Validates JSON outputs before persistence
- [ ] Honors rate limits and scheduling rules
- [ ] Adds/updates tests and prompt snapshots
- [ ] Documentation updated where needed

## Change Management
- Document any changes to prompts, models, or defaults in `CHANGELOG.md`.
- Bump prompt versions and note rationale.
- Announce breaking changes to the team and update runbooks.
