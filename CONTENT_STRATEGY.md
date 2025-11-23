# Content Logic Strategy - DO NOT MODIFY WITHOUT APPROVAL

## Core Principle: "Allowlist" over "Blocklist"
The system defaults to treating all content as **External** unless it explicitly proves it is **Owned**. This prevents 3rd party content from leaking into "Owned" sections (Hero, Trending Now).

## Owned Content Criteria
A content item is considered "Owned" (Internal) ONLY if:
1.  **Source Name**: Matches `['TDD', 'LNLS', 'The Daily Dunk', 'TDD Podcast', 'TDD YouTube']`.
2.  **Content Type**: Is `podcast` or `video` (assuming these only come from our controlled feeds).
3.  **URL Pattern**: Starts with `/` (relative internal link) or contains `lnls.media`.

## External Content
Everything else is **External**. This includes:
*   RSS Feed items (ESPN, Bleacher Report, etc.)
*   Any article with an external URL that doesn't match the Owned criteria.

## File Location
Logic is centralized in: `lib/content.ts`

## Modification Rule
**NEVER** revert to a "Blocklist" strategy (e.g., "if not ESPN, then Owned"). This is insecure and leads to content leaks. Always add new Owned sources to the explicit Allowlist.
