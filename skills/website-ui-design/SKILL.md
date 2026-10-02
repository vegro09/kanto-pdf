---
name: website-ui-design
description: Use this skill whenever designing, building, or reviewing UI for websites or web apps — landing pages, dashboards, marketing sites, layout, visual style. Trigger on requests like "design this page", "build a website UI", "make this site look modern", "improve this landing page", or any request to create or improve website visuals. This is the primary skill for making website UI look premium, current, and best-in-class.
---

## Purpose

Push every website UI toward a premium, modern, best-in-class result by default — not a generic template site. Treat every design request as a chance to make deliberate, high-craft choices in layout, type, and motion, not just "make it work."

## Design Philosophy

- Default to distinctive over generic. Avoid the "default template" look (centered hero + 3 feature cards + generic stock photo) unless explicitly asked for something simple.
- Every page needs ONE clear visual hierarchy path: the eye should know where to go first, second, third.
- Depth and richness come from typography scale, whitespace, and intentional color — not clutter.
- Consistency across pages: once a pattern (button style, card style, section rhythm) is set, reuse it site-wide.

## Component Library (Approved)

- shadcn/ui + Radix primitives — default choice for web apps
- HeroUI — alternative for marketing/landing pages
- Material UI — only for Android-style/native-feeling web views
- Ant Design — only for dense admin/dashboard screens

## Style Directions (Pick One Per Project, Stay Consistent)

- **Minimal/Editorial**: large type, generous whitespace, monochrome + one accent, content-first.
- **Bold/Vibrant**: saturated color blocks, large confident type, high contrast, strong CTAs.
- **Dark Premium**: dark background, high-contrast text, accent used sparingly (fits Kanto Empire's "royal/imperial" direction).
- **Soft/Approachable**: rounded shapes, warm palette, friendly illustrations/icons.

Ask which direction fits the brand if not specified; default to Dark Premium for portfolio/brand sites, Minimal/Editorial for content/blog sites.

## Layout & Grid

- Base spacing unit: 8px (multiples of 8: 8/16/24/32/48/64/96/128) — websites can afford more generous spacing than mobile.
- Max content width: 1200–1280px for text-heavy content; full-bleed sections allowed for hero/visual moments.
- Responsive breakpoints: 360px (mobile) / 768px (tablet) / 1024px (laptop) / 1440px+ (desktop).
- Section vertical rhythm: 80–120px padding between major sections on desktop, 48–64px on mobile.

## Typography

- Type scale (desktop): 14 (caption) / 16 (body) / 20 (subtitle) / 28 (h3) / 40 (h2) / 56–72 (h1/display).
- Use fluid type sizing (`clamp()`) so headings scale smoothly between mobile and desktop rather than jumping at breakpoints.
- Max 2 font families (one for display/headings, one for body) — pairing a distinctive display font with a clean body font reads as more premium than one font everywhere.
- Line height: 1.5–1.6 body, 1.1–1.2 large headings.
- Arabic: proper Arabic-supporting font (Cairo, Tajawal, IBM Plex Sans Arabic, or a matching elevated Arabic display font for brand moments), line-height 1.7–1.9 for body.

## Color & Contrast

- One primary, one accent (used sparingly for CTAs/highlights), 5–7 neutral grays, semantic colors.
- WCAG AA contrast minimum (4.5:1 body text, 3:1 large text).
- Reserve the accent color for the 1–2 things you most want the user to notice (primary CTA, key stat) — using it everywhere kills its impact.

## Navigation & Structure

- Sticky header only when it adds real value (persistent CTA, wayfinding on long pages) — not by default.
- Clear, minimal primary nav (5–7 items max); push secondary items to a footer or dropdown.
- Footer should be a real utility, not an afterthought: sitemap, contact, social, legal.

## Hero & Above-the-Fold

- The hero must communicate value proposition in under 3 seconds — headline + one supporting line + one clear primary CTA.
- Avoid generic stock photography; prefer custom illustration, product screenshots, or abstract brand-driven visuals.
- Reserve space for hero media to avoid layout shift (CLS).

## Motion & Polish (pairs with the web-animation skill)

- Scroll-reveal animations on section entry (fade + slight upward slide) as a baseline — static pages read as unfinished at this point in web design.
- Hover states on every interactive element (subtle scale, color shift, or underline animation) — never a completely static hover.
- Respect `prefers-reduced-motion` for all animation.

## Responsive & Performance

- Mobile-first build, then enhance for larger viewports — not the reverse.
- Compress and serve modern image formats (WebP/AVIF), lazy-load below-the-fold media.
- Avoid layout shift: reserve space for all images/embeds before they load.

## RTL / Bilingual

- Full mirroring for Arabic RTL: nav direction, icon direction, card layouts, not just text alignment.
- Separate, natively-written Arabic copy — not machine-translated — since tone/rhythm differ meaningfully from English.

## Process (Apply to Every UI Request)

1. Identify or confirm the style direction (Minimal/Editorial / Bold / Dark Premium / Soft) before building.
2. Apply the 8px spacing system and fluid type scale.
3. Design the hero/above-the-fold to communicate value in 3 seconds.
4. Build in hover states and scroll-reveal motion by default.
5. Verify RTL/LTR mirroring if bilingual.
6. Before finalizing, self-check: does this look like a generic template, or does it look intentional and premium? Check whitespace generosity, type pairing, and whether the accent color is used with restraint.

## Reference

Check the `kanto-canvas` design source repo if present in the workspace for exact tokens (colors, radii, specific component variants) before defaulting to the generic values above.
