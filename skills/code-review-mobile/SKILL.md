---
name: code-review-mobile
description: Use this skill whenever writing, reviewing, or finalizing mobile/Android app code (Godot/GDScript, Flutter, React Native, native Android) — before merging, shipping, or presenting code as done. Trigger on requests like "review this code", "check this before I ship it", "is this ready", or automatically apply when generating substantial new mobile app or game code. Covers security, error handling, and performance for mobile/game stacks specifically.
---

## Purpose

Catch the mistakes that AI-generated mobile/game code commonly ships with silently — exposed keys, unhandled crashes, memory leaks, battery-draining patterns — before the user finds out via a bad review or crash report. Applied automatically to any non-trivial code generation, not just when explicitly asked to "review."

## Security Checklist (Non-Negotiable)

- No API keys, AdMob IDs meant to stay server-side, or Supabase service role keys hardcoded in client code shipped to the app store — use build-time environment injection or a backend/edge function for anything sensitive.
- Never store sensitive user data (auth tokens, personal info) in plain local storage/`SharedPreferences`/localStorage-equivalent without encryption — use secure storage APIs (Android Keystore-backed secure storage, Flutter Secure Storage, etc.).
- Validate all data coming from local storage/save files before use — corrupted or tampered save data (e.g. localStorage-based game saves) shouldn't crash the app or allow exploits (e.g. modified currency/scores in a monetized game).

## Error & Crash Handling

- Every async operation (network call, file I/O, ad load) has explicit error handling — an unhandled exception on a background thread can crash the whole app, not just fail silently like on web.
- Ad load failures (AdMob) must never block core app functionality — always have a fallback path if a rewarded/interstitial ad fails to load.
- Handle offline/no-connectivity states explicitly — mobile users lose connectivity far more often than web users; don't let the app hang or crash when a network call fails.
- Wrap platform-specific calls (permissions, storage, camera) in try/catch with a graceful fallback UI, not a silent crash.

## Performance & Battery

- Avoid animating or polling on the main/UI thread — use hardware-accelerated animation APIs (matches the mobile-app-animation skill) and background threads/isolates for heavy work.
- Clean up listeners, timers, and subscriptions (realtime, location, sensors) when a screen/scene is destroyed — leaked listeners are a leading cause of memory leaks and battery drain in mobile apps.
- Avoid loading/holding large images or assets in memory longer than needed — release resources when a screen is no longer active (especially relevant for Godot scenes and image-heavy screens).
- Batch network requests where possible instead of frequent small polling calls, which drain battery and data.

## Code Consistency & Quality

- Match existing patterns already established in the codebase (state management approach, file/scene structure, naming conventions) rather than introducing a new pattern for the same problem.
- No leftover debug print statements (`print()`, `console.log`, `Log.d` debug calls) in code presented as release-ready.
- Function/variable/node names describe what they do; avoid vague names (`data`, `temp`, `node2`).
- For Godot specifically: keep scene structure clean (avoid deeply nested unnecessary nodes), use signals for decoupled communication rather than tightly coupling scenes via direct references where avoidable.

## Platform-Specific Checks

- **Godot**: confirm export settings (API level, permissions) match current Play Store requirements before considering a build ready; check that `Tween`/`AnimationPlayer` nodes are properly freed/stopped when scenes change.
- **Flutter**: dispose controllers (`AnimationController`, `TextEditingController`, `ScrollController`) in `dispose()` — a very common leak source.
- **React Native**: clean up listeners in `useEffect` return functions; verify Reanimated worklets aren't referencing stale state.
- **Native Android**: verify lifecycle-aware components (ViewModel, LiveData/Flow collectors tied to lifecycle) rather than manual, leak-prone patterns.

## Accessibility Baseline

- Every new interactive element meets the baseline from the accessibility-mobile skill (content description, 48x48dp touch target, sufficient contrast) — don't ship new UI that regresses accessibility even if a11y wasn't the explicit ask.

## Before Calling Code "Done"

Run through this list before presenting code as finished/ready to ship:
1. Any secrets or keys exposed in client-shipped code? → Fix before anything else.
2. Any unhandled error paths (failed network call, failed ad load, invalid save data)? → Add handling.
3. Any listeners/controllers/subscriptions left uncleaned on screen/scene teardown? → Fix leaks.
4. Does this match the existing codebase's patterns and target platform conventions?
5. Would this survive a user losing connectivity mid-action, backgrounding the app, or force-closing and reopening it?

## Process

1. While writing code, apply the security, error-handling, and cleanup checklist inline — don't defer it to a later pass.
2. Before presenting code as final, run the "Before Calling Code Done" checklist explicitly.
3. Flag anything that needed a shortcut or has a known limitation rather than presenting it as fully complete.
