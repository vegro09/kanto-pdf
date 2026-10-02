---
name: ui-app-design
description: Use this skill whenever generating, editing, or reviewing UI screens for web apps or mobile/Android apps. Covers component selection, layout conventions, spacing, typography, color usage, RTL/LTR handling, and design consistency. Trigger on requests like "design a screen", "build a UI", "create a component", "make this look better", or any task involving app/website visual design.
---

## Purpose

Guide the agent to produce consistent, professional UI for both web and mobile projects, using only approved component libraries and following a single design language across all screens.

## Approved Component Libraries

Use ONLY these libraries. Do not introduce other UI kits without asking first.

- shadcn/ui (default choice for web apps)
- Radix (for unstyled/accessible primitives underlying custom components)
- HeroUI (alternative for marketing/landing pages)
- Material UI (only for Android-style/native-feeling web views)
- Ant Design (only for dense admin/dashboard screens)

When unsure which library fits, default to shadcn/ui + Radix.

## Layout Rules

- Mobile-first: design for a 360–400px width baseline, then scale up.
- Use consistent spacing scale: 4/8/12/16/24/32/48px — no arbitrary values.
- Max content width on web: 1200px, centered, with responsive padding.
- Touch targets on mobile: minimum 44x44px.
- Always design for both RTL (Arabic) and LTR (English) layouts. Use logical CSS properties (`margin-inline-start`, not `margin-left`) so layouts flip correctly.

## Typography

- One font family per project, max 2 for headings vs body.
- Type scale: use a modular scale (e.g. 12/14/16/20/24/32/40px), not arbitrary sizes.
- Line height: 1.4–1.6 for body text, 1.1–1.3 for headings.
- Arabic text: ensure font supports Arabic glyphs properly (e.g. Cairo, Tajawal, IBM Plex Sans Arabic) and increase line-height slightly (1.6–1.8) for readability.

## Color

- Define a small palette: 1 primary, 1 secondary/accent, neutrals (5–7 grays), plus semantic colors (success/warning/error/info).
- Always check contrast ratio (WCAG AA minimum: 4.5:1 for body text).
- Dark theme default unless the project specifies otherwise (matches prior projects like Signal).

## Mobile/Android-Specific Rules

- Follow Material Design spacing/elevation conventions when targeting native-feeling Android screens.
- Bottom navigation for primary app sections; avoid hamburger menus for core navigation on mobile.
- Respect safe areas (status bar, notch, gesture bar).
- Use platform-appropriate motion: quick, subtle transitions (150–250ms).

## Web-Specific Rules

- Responsive breakpoints: 360px (mobile), 768px (tablet), 1024px+ (desktop).
- Sticky headers only when they add clear navigational value.
- Avoid layout shift: reserve space for images/async content.

## Bilingual (Arabic/English) Rules

- Every screen must support full RTL mirroring, not just text alignment — icons, navigation direction, and card layouts should flip.
- Keep Arabic copy concise; Arabic text is often ~20-30% longer than English, so leave room in buttons/labels.
- Numerals: use Arabic-Indic or Western numerals consistently per project convention (confirm with user if unclear).

## Process

1. Identify whether the target is web, mobile, or both.
2. Pick the component library per the rules above.
3. Sketch the layout mentally against the spacing/type scale before writing code.
4. Build with RTL/LTR support from the start, not retrofitted later.
5. Cross-check contrast, touch targets, and responsive behavior before finalizing.

## Reference

For project-specific design tokens (colors, exact component variants), check the `kanto-canvas` design source repo if present in the workspace before defaulting to generic values.
