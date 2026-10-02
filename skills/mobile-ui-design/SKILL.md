---
name: mobile-ui-design
description: Use this skill whenever designing, building, or reviewing UI for mobile/Android apps — screens, components, navigation patterns, visual style, layout. Trigger on requests like "design this screen", "build a mobile UI", "make this app look modern", "improve this app's design", or any request to create or improve mobile app visuals. This is the primary skill for making mobile app UI look premium, current, and best-in-class.
---

## Purpose

Push every mobile UI screen toward a premium, modern, best-in-class result by default — not a generic template. The agent should treat every design request as an opportunity to make deliberate, high-craft choices, not just "make it work."

## Design Philosophy

- Default to distinctive over generic. Avoid the "default Bootstrap/Material look" unless the brand explicitly calls for it — pick an intentional visual direction (see Style Directions below) and commit to it across the whole app.
- Every screen should have ONE clear focal point. Don't let five things compete for attention.
- Depth and hierarchy come from spacing, type weight, and subtle elevation — not from adding more borders/dividers.
- Consistency beats novelty: once a pattern is set (card style, button shape, spacing rhythm), reuse it everywhere in the app.

## Component Library (Approved)

- shadcn/ui + Radix primitives (via React Native equivalents / web views)
- HeroUI for marketing/onboarding-style screens
- Material UI only when explicitly building a Material-style Android-native feel
- Ant Design only for dense admin/dashboard mobile views
- Default: shadcn/ui + Radix unless brand direction says otherwise

## Style Directions (Pick One Per Project, Stay Consistent)

- **Minimal/Clean**: generous whitespace, thin type weights, monochrome + one accent color, subtle shadows.
- **Bold/Vibrant**: saturated primary color, high contrast, larger type, confident use of color blocks.
- **Dark Premium**: dark background (#0A0A0A–#121212), high-contrast text, accent color used sparingly for CTAs/highlights (matches prior Signal game direction).
- **Soft/Friendly**: rounded corners (16–24px radius), pastel or warm palette, soft shadows, playful micro-copy.

Ask which direction fits the brand if not specified; default to Dark Premium for utility/game apps, Minimal/Clean for productivity/business apps.

## Layout & Spacing

- Base unit: 4px. All spacing values are multiples of 4 (4/8/12/16/24/32/48/64).
- Screen padding: 16–20px horizontal minimum on mobile.
- Card/component internal padding: 12–16px minimum for touch comfort.
- Consistent vertical rhythm between sections: 24–32px.

## Typography

- Type scale (mobile): 12 (caption) / 14 (body small) / 16 (body) / 20 (subtitle) / 24 (title) / 32 (display).
- Max 2 font weights per screen (e.g. Regular + Semibold) — avoid using 4+ weights.
- Line height: 1.4–1.5 for body, 1.2 for headings.
- Arabic: use a font with proper Arabic glyph support (Cairo, Tajawal, IBM Plex Sans Arabic), increase line-height to 1.6–1.8.

## Color & Contrast

- One primary brand color, one accent (used sparingly, <10% of screen), 5–7 neutral grays, semantic colors (success/error/warning/info).
- WCAG AA minimum contrast (4.5:1) for all body text.
- Never rely on color alone to convey state — pair with icon/text.

## Navigation Patterns

- Bottom tab bar for 3–5 primary sections (not a hamburger menu) — this is the modern mobile-native standard.
- Use a floating action button (FAB) only for one clear primary action, not multiple.
- Modals/bottom sheets for secondary flows, not full-screen pushes, when the action is quick (confirm, filter, quick-edit).

## Micro-Interactions & Polish

- Every tappable element needs visible feedback (scale-down 0.96–0.98 on press, or color shift) — a screen with zero feedback reads as unfinished.
- Loading states: skeleton screens over spinners where possible — feels faster and more premium.
- Empty states: never leave a blank screen — always design an empty state with a clear next action.
- Error states: human, specific messaging — not raw error codes.

## Elevation & Depth

- Use subtle shadows or slight background contrast for cards, not heavy drop shadows.
- Max 2–3 elevation levels in the whole app (base, raised, floating) — more than that becomes visually noisy.

## RTL / Bilingual

- Mirror all directional elements (icons, navigation, swipe gestures, card layouts) for Arabic RTL — never just flip text alignment.
- Leave extra width in buttons/labels for Arabic text (typically 20–30% longer than English equivalents).

## Process (Apply to Every UI Request)

1. Identify or confirm the style direction (Minimal / Bold / Dark Premium / Soft) before building.
2. Apply the 4px spacing system and type scale — don't use arbitrary values.
3. Choose the component library per project convention (check kanto-canvas if present).
4. Build in micro-interactions (press feedback, loading, empty, error states) by default — don't wait to be asked.
5. Verify RTL/LTR mirroring if bilingual.
6. Before finalizing, self-check: does this look like a generic template, or does it look intentional and premium? If generic, push further — check spacing consistency, type hierarchy, and whether the one accent color is used with restraint.

## Reference

Check the `kanto-canvas` design source repo if present in the workspace for exact tokens (colors, radii, specific component variants) before defaulting to the generic values above.
