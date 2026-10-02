---
name: accessibility-mobile
description: Use this skill whenever building or reviewing accessibility for mobile/Android apps — TalkBack support, touch target sizing, content labeling, focus order, or contrast for mobile UI. Trigger on requests like "make this app accessible", "add content descriptions", "check touch target sizes", "fix TalkBack navigation", or any accessibility task for a mobile app (Flutter, React Native, native Android, or Godot).
---

## Purpose

Build mobile apps usable by people relying on TalkBack (Android screen reader), switch access, or with visual/motor impairments — by default, integrated into the UI build process, not a separate late-stage pass.

## Touch Targets

- Minimum touch target size: 48x48dp (Android accessibility guideline) — this is stricter than general "44px" mobile UI advice and should be the accessibility floor.
- Adequate spacing between adjacent touch targets (at least 8dp) to prevent mis-taps for users with motor impairments.
- Don't shrink touch targets to fit dense layouts — redesign the layout instead.

## Content Labeling (TalkBack / Screen Readers)

- Every interactive element (button, icon button, image button) needs a content description (`contentDescription` in native Android, `accessibilityLabel` in React Native, `Label` semantics in Flutter) — icon-only buttons especially need this since there's no visible text fallback.
- Decorative images/icons should be explicitly marked as non-informative (`importantForAccessibility="no"` or equivalent) so TalkBack skips them instead of reading meaningless labels.
- Dynamic content changes (score updates, form errors, loading states) should trigger accessibility announcements (`accessibility live region` equivalent) so screen reader users are notified without needing to manually re-navigate.

## Focus Order & Navigation

- Reading/focus order should match visual layout order — test that TalkBack's swipe navigation moves through elements in a logical sequence, not a randomized DOM/widget-tree order.
- Grouped related elements (e.g. a card with title + description + action) should be navigable as one logical unit where appropriate, not forcing the user through every sub-element individually.
- Custom gesture-based interactions (swipe to delete, drag to reorder) need an accessible alternative (e.g. a long-press menu with the same actions) since screen reader users often can't perform arbitrary custom gestures reliably.

## Color & Contrast

- WCAG AA minimum: 4.5:1 for text, 3:1 for large text and meaningful icons/UI components.
- Never rely on color alone for state (error, success, selected) — pair with icon, text, or shape change.
- Test both light and dark theme variants (matches the Dark Premium default from the mobile-ui-design skill) for contrast compliance.

## Text & Scaling

- Support the OS-level font size/scaling setting — text should reflow/scale rather than clip or overlap when the user increases system font size.
- Avoid fixed-height containers around text that could clip content at larger accessibility font sizes.

## Forms & Input

- Every input field has an associated, programmatically linked label — not just adjacent placeholder text (placeholders disappear on input and aren't reliably read by all screen readers).
- Error messages should be announced automatically when they appear, and linked to their corresponding field.

## Motion

- Respect the OS "reduce motion" accessibility setting — provide a reduced-motion alternative for animated transitions and effects (pairs with the mobile-app-animation skill).
- Avoid rapid flashing/strobing effects (seizure risk), especially relevant for game-style feedback animations.

## Bilingual (Arabic/English) Accessibility

- Ensure TalkBack correctly switches pronunciation/reading direction based on the app's language setting.
- Verify RTL layouts don't break focus/swipe navigation order for Arabic — the logical reading order should follow the RTL flow, not a leftover LTR order.

## Testing Checklist

- Turn on TalkBack (or the platform equivalent) and navigate the entire core flow using only swipe/gestures — can the primary task be completed?
- Increase system font size to maximum and check for clipped or overlapping text.
- Check touch target sizes against the 48x48dp minimum on the densest screens.

## Process

1. Add content descriptions/labels to every interactive and meaningful element as part of the initial build.
2. Enforce 48x48dp minimum touch targets with adequate spacing.
3. Verify focus/reading order matches visual layout.
4. Provide accessible alternatives for any custom gesture-only interaction.
5. Test with the screen reader enabled before considering the feature complete.
