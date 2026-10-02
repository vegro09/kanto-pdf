---
name: accessibility-web
description: Use this skill whenever building or reviewing accessibility (a11y) for websites or web apps — screen reader support, keyboard navigation, ARIA attributes, color contrast, or WCAG compliance. Trigger on requests like "make this accessible", "add ARIA labels", "check contrast", "fix keyboard navigation", or any accessibility task for a website/web app.
---

## Purpose

Build websites that are usable by people relying on screen readers, keyboard-only navigation, or with visual/motor impairments — by default, not as an afterthought pass.

## Semantic HTML First

- Use native HTML elements for their intended purpose (`<button>` not `<div onclick>`, `<nav>`, `<main>`, `<header>`, `<footer>`) — semantic elements carry built-in accessibility behavior that ARIA can't fully replace.
- Only reach for ARIA attributes when semantic HTML genuinely can't express the pattern (custom widgets: tabs, modals, comboboxes).
- One `<h1>` per page; logical heading order (no skipped levels) — screen reader users navigate by heading structure.

## Keyboard Navigation

- Every interactive element must be reachable and operable via keyboard alone (Tab, Shift+Tab, Enter, Space, Arrow keys where relevant).
- Visible focus indicator on every focusable element — never remove `outline` without providing an equally visible custom focus style.
- Logical tab order matching visual reading order — avoid `tabindex` values above 0 (they break natural order); use `tabindex="-1"` only to programmatically focus non-interactive elements.
- Modals/dialogs must trap focus while open and return focus to the triggering element on close.

## ARIA & Screen Reader Support

- Label all form inputs with associated `<label>` elements (or `aria-label`/`aria-labelledby` if a visible label isn't possible).
- Icon-only buttons need an `aria-label` describing the action ("Close", "Search"), not just an icon.
- Use `aria-live` regions for dynamic content updates (form errors, toast notifications, loading states) so screen readers announce changes.
- Decorative images: `alt=""`. Meaningful images: descriptive `alt` text conveying the content/purpose, not just "image of...".
- Don't overuse ARIA roles on elements that already have correct semantics — redundant/conflicting ARIA can make things worse than no ARIA.

## Color & Contrast

- WCAG AA minimum: 4.5:1 contrast for normal text, 3:1 for large text (18px+ bold or 24px+ regular) and UI components/icons.
- Never convey information (errors, required fields, status) through color alone — pair with text, icon, or pattern.
- Test both light and dark theme variants for contrast compliance, not just one.

## Forms

- Clear, programmatically associated error messages (`aria-describedby` linking input to error text), not just color changes.
- Group related fields with `<fieldset>` and `<legend>` where appropriate (e.g. radio button groups).
- Indicate required fields both visually and via `aria-required` or `required` attribute.

## Motion & Animation

- Respect `prefers-reduced-motion` — provide a reduced/no-motion alternative for users with this OS setting enabled (pairs with the web-animation skill).
- Avoid flashing content more than 3 times per second (seizure risk).

## Bilingual (Arabic/English) Accessibility

- Set `lang` attribute correctly per page/section (`lang="ar"`, `lang="en"`) — screen readers use this to select correct pronunciation rules.
- Ensure `dir="rtl"` doesn't break focus order or ARIA landmark navigation for Arabic pages.

## Testing Checklist

- Navigate the entire page/flow using only Tab/Shift+Tab/Enter — can you complete the primary task?
- Run an automated checker (axe, Lighthouse accessibility audit) as a baseline, but don't treat a passing automated score as "done" — manual keyboard/screen-reader testing catches issues automated tools miss.
- Check contrast on all text/background color combinations, including hover/focus states.

## Process

1. Build with semantic HTML first; reach for ARIA only for custom widget patterns.
2. Ensure full keyboard operability and visible focus states as part of initial build, not a later pass.
3. Label all interactive elements and form inputs correctly.
4. Verify contrast ratios meet WCAG AA across all themes.
5. Test with keyboard-only navigation before considering the feature complete.
