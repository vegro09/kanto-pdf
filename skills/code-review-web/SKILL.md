---
name: code-review-web
description: Use this skill whenever writing, reviewing, or finalizing web app code (React, JS/TS, Supabase-connected frontends) — before merging, shipping, or presenting code as done. Trigger on requests like "review this code", "check this before I ship it", "is this ready", or automatically apply when generating substantial new web app code. Covers security, error handling, and consistency for web/JS stacks specifically.
---

## Purpose

Catch the mistakes that AI-generated code commonly ships with silently — exposed secrets, missing error handling, unvalidated input — before the user finds out in production. Applied automatically to any non-trivial code generation, not just when explicitly asked to "review."

## Security Checklist (Non-Negotiable)

- No API keys, secrets, or service role tokens hardcoded in client-side code — these belong in environment variables and, for truly sensitive keys (Supabase service role, payment secrets), in edge functions/server-side only, never shipped to the browser.
- All user input is validated and sanitized before use in queries, rendering, or forwarding to APIs — never trust client-supplied data, even from your own app's frontend.
- No `dangerouslySetInnerHTML` (React) or raw `innerHTML` insertion of user-supplied content without sanitization — this is a direct XSS vector.
- Confirm RLS (if Supabase) actually restricts what this code path can access — client-side checks are UX, not security; the real security boundary is the database policy.

## Error Handling

- Every async call (API request, database query, file operation) has explicit error handling — no silent failures, no unhandled promise rejections.
- User-facing error messages are clear and actionable, not raw error objects or stack traces surfaced in the UI.
- Network/loading failures degrade gracefully (retry option, clear message) rather than leaving a blank or frozen UI.

## Code Consistency & Quality

- Match existing patterns already established in the codebase (naming conventions, file structure, state management approach) rather than introducing a new pattern for the same problem.
- No commented-out dead code or leftover `console.log` debugging statements in code presented as final/ready.
- Component/function names describe what they do; avoid vague names (`data`, `handleStuff`, `temp`).
- Extract repeated logic into shared functions/hooks rather than duplicating — but don't over-abstract a single-use case prematurely.

## Performance Basics

- Avoid unnecessary re-renders (React): memoize expensive computations, avoid creating new object/array literals inline in render where it causes child re-renders unnecessarily.
- Avoid N+1 query patterns — batch database calls where possible instead of looping individual requests.
- Lazy-load non-critical components/routes rather than bundling everything into the initial load.

## Accessibility Baseline

- Every new interactive element meets the baseline from the accessibility-web skill (keyboard operable, labeled, sufficient contrast) — don't ship new UI that regresses accessibility even if a11y wasn't the explicit ask.

## Before Calling Code "Done"

Run through this list before presenting code as finished/ready to ship:
1. Any secrets or keys exposed in client-side code? → Fix before anything else.
2. Any unhandled error paths (failed request, empty state, invalid input)? → Add handling.
3. Any unvalidated user input reaching a query, render, or external call? → Validate/sanitize.
4. Does this match the existing codebase's patterns, or does it introduce unnecessary inconsistency?
5. Would this survive a user doing something unexpected (double-clicking submit, going offline mid-action, pasting garbage into a field)?

## Process

1. While writing code, apply the security and error-handling checklist inline — don't defer it to a "review pass" that may not happen.
2. Before presenting code as final, run the "Before Calling Code Done" checklist explicitly.
3. Flag anything that needed a shortcut or has a known limitation rather than presenting it as fully complete.
