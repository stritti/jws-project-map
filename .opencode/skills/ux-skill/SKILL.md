---
name: ux-skill
description: >-
  UI/UX design, accessibility (a11y), and visual polish for the JWS Project Map
  app. Use when implementing or reviewing user-facing components — layouts,
  interactions, responsive behavior, focus management, screen reader support,
  keyboard navigation, animations, reduced motion, i18n, and BootstrapVueNext
  component usage.
---

# UX & Accessibility Skill — JWS Project Map

Guide for implementing and reviewing user-facing UI with a focus on usability,
inclusive design, and accessibility (a11y).

## Design System

### Bootstrap 5.3 + BootstrapVueNext 0.44

- All BootstrapVueNext components are **auto-imported** at build time via
  `unplugin-vue-components` with `BootstrapVueNextResolver`. Never write
  import statements for them.
- Never edit `components.d.ts` — it is auto-generated.
- **Available components** (most common): `b-button`, `b-card`, `b-card-img`,
  `b-card-body`, `b-card-title`, `b-modal`, `b-form-input`,
  `b-form-checkbox`, `b-form-checkbox-group`, `b-list-group`,
  `b-list-group-item`, `b-nav`, `b-dropdown`, `b-avatar`.

### Icons

- Icons via `unplugin-icons` (Iconify). Use `<IconBiName />` for Bootstrap
  Icons, `<IconMdiName />` for Material Design Icons, etc.
- Mark decorative icons with `aria-hidden="true"`.
- Icons resolving interactive meaning need an `aria-label` on the parent
  element.

### Typography & Color

- Primary brand color: `#3d5e9e` (JWS Blue).
- Font: `"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`.
- Headings: weight 700, letter-spacing -0.02em.
- Background: `#f8fafc`, text: `#1e293b`, muted: `#64748b`.
- CSS custom properties on `:root` (see `style-config.scss`).

### Responsive Philosophy

- **Mobile-first** — all layouts start at small viewport and scale up.
- The app is primarily used on mobile. The map view (`HomeView`) dedicates
  almost the full viewport to the map; the search/filter bar overlays or
  collapses.
- Virtual keyboard support: on mobile, the search bar pops to the top of the
  page when the search input is focused (`useWebFrame` composable in
  `src/composables/useWebFrame.ts`). This replaces the `position: fixed`
  bottom-bar pattern because fixed elements don't track the virtual keyboard.
- Use `100dvh` (dynamic viewport height) instead of `100vh` to account for
  mobile browser chrome and keyboard.
- Breakpoints are Bootstrap 5 defaults: sm ≥576px, md ≥768px, lg ≥992px,
  xl ≥1200px, xxl ≥1400px.

## Accessibility Standards

**WCAG 2.1 AA** is the target. This project already implements several key
patterns. Maintain and extend these.

### Focus Management

**Global focus ring** (defined in `src/assets/a11y.scss`):
- `:focus-visible` gets a `2px solid #3d5e9e` outline with `2px offset`.
- `:focus:not(:focus-visible)` removes the outline (mouse users don't see it).
- Individual components may add specific `:focus-visible` styles with
  different colors/weights where appropriate.

**Focus restore** (`src/composables/useAccessibility.ts`:
`useFocusRestore()`):
- Save the trigger element before opening a modal/panel/dialog.
- Restore focus to it when the overlay closes.
- Used by: gallery modal, filter panel, floating meta panel.

**Skip-to-map link** (`HomeView.vue`):
- Positioned off-screen (`top: -100%`), slides into view on `:focus`.
- Allows keyboard users to skip the search bar and jump directly to the map.

**Modal focus trapping**:
- `b-modal` handles focus trapping and restoration automatically.
- Custom overlays (gallery, filter panel) must implement their own focus
  trapping: trap Tab/Shift+Tab within the dialog, close on Escape.

### Screen Reader (aria-live)

The `announceToScreenReader()` function in `useAccessibility.ts` manages a
singleton `aria-live="polite" aria-atomic="true"` region (`sr-only`).

**When to announce:**
- Search results count changes
- Projects finish loading
- View mode switches (map ↔ list)
- Filter applied/reset
- Any dynamic content update that isn't obvious to a screen reader user

Usage:
```typescript
import { announceToScreenReader } from "@/composables/useAccessibility"
announceToScreenReader("7 projects found")
```

### ARIA Attributes

Current patterns used throughout:

| Pattern | Example |
|---|---|
| `role="region"` + `aria-label` on map | `<div role="region" aria-label="Map">` |
| `role="group"` + `aria-label` on button groups | map type toggle, language selector |
| `role="listbox"` / `role="option"` on search results | SearchModal, HomeView search |
| `role="dialog"` on custom modals | ProjectGalleryModal, FilterPanel |
| `role="status"` + `aria-live="polite"` on live regions | search result counters |
| `role="navigation"` + `aria-label` | MainMenu |
| `role="contentinfo"` | SiteFooter |
| `role="complementary"` | FilterPanel |
| `aria-current="page"` on active nav items | MainMenu |
| `aria-pressed` on toggle buttons | map type toggle |
| `aria-hidden="true"` on decorative icons | all `<IBi*>` icons |
| `aria-label` on icon-only buttons | back, share, navigate, close |

**Rules:**
- Every interactive element must have an accessible name (content text,
  `aria-label`, or `aria-labelledby`).
- Every icon-only button MUST have an `aria-label`.
- Images MUST have `alt` text (or `alt=""` if decorative).
- Use semantic HTML elements where possible (`<nav>`, `<footer>`,
  `<button>`, `<main>`) and add ARIA only when the semantic meaning is
  insufficient.

### Keyboard Navigation

- All interactive elements must be reachable and operable via keyboard (Tab,
  Enter, Space, Arrow keys, Escape).
- **Custom gallery**: Arrow keys for prev/next, Escape to close, Tab/Shift+Tab
  to move between controls, `onKeydown` handler on the dialog wrapper.
- **Search results**: Arrow up/down to navigate, Enter to select, Escape to
  close (`SearchModal.vue` uses `@keydown` + `@keyup` on results).
- **Filter panel**: Escape to close, Tab to move between checkboxes.
- **Map**: Leaflet handles keyboard pan/zoom natively. `aria-label` added to
  zoom controls dynamically in `LocationMap.vue` via JavaScript.
- **Skip links** should be the first focusable element on each page.

### Reduced Motion

Respect `prefers-reduced-motion` (already in `App.vue`):
```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Do NOT add CSS transitions, animations, or JavaScript-driven motion effects
that are purely decorative. If motion serves a functional purpose (e.g., a
progress indicator), ensure it respects `prefers-reduced-motion`.

### HTML lang

- The `<html lang>` attribute is bound to the current i18n locale in `main.ts`
  via `useHtmlLang(i18n)` (`useAccessibility.ts`).
- It updates reactively when the user switches languages.

### Color Contrast

- Primary text: `#1e293b` on background `#f8fafc` — passes WCAG AAA.
- Muted text: `#64748b` — use sparingly; prefer the primary text color for
  body content.
- Link/CTA buttons use `#3d5e9e`.
- The `.high-contrast-text` utility class provides `#1a1a1a` on any
  background.
- When adding new UI colors, verify contrast ratio ≥ 4.5:1 for normal text and
  ≥ 3:1 for large text (WCAG AA).

## Internationalization (i18n)

- All user-visible strings go through `vue-i18n` with `useI18n()` and `t()`.
- Locale files: `src/locales/{de,en,fr}.json`.
- Supported locales: `de`, `en`, `fr`.
- Locale is persisted in `localStorage` under key `jws-locale`.
- `aria-label` and `aria-description` values MUST use `t()` — never hardcode
  English strings.
- The `<html lang>` attribute stays in sync via `useHtmlLang()`.
- Category and country names are locale-aware (fetched from NocoDB with
  locale-specific fields, transformed in the service layer).

## UX Patterns

### Search & Filter

- **Two-tier search**: Map view uses inline search bar; a global `SearchModal`
  (Ctrl+K / Cmd+K) provides full-text search across all projects.
- **Filter panel** (`FilterPanel.vue`): slide-out drawer with
  `b-form-checkbox-group` for state, category, and country filters.
- **View toggle**: Switch between map and list view. Active view is indicated
  visually and via `aria-current`.
- **Search results**: Listed with `role="listbox"` / `role="option"`. Arrow
  keys navigate, Enter selects, Escape closes.

### Project Cards (ProjectListItem)

- `b-card` with `no-body`, containing `b-card-img` + `b-card-body`.
- Title uses `text-truncate` for overflow.
- `b-card-img` uses `left` position, `height: 100%`, `object-fit: cover`.
- Card must have an `aria-label` derived from the project name.

### Map

- Lazy-loaded `LocationMap` component (stays out of initial bundle).
- Map type toggle: carto (default), satellite, OSM.
- Pin clustering for performance.
- Map keyboard instructions announced when map receives focus.

### Modals & Overlays

- **About**: `b-modal` with version info, data source, reload button.
- **Gallery**: Custom fullscreen overlay with `role="dialog"`, focus trapping,
  keyboard navigation, and `aria-live` for image position announcements.
- **Filter**: Custom slide-out panel with `role="complementary"`.
- **FloatingMeta**: Bottom-sheet style expandable panel for metadata actions.

## Review Checklist

When reviewing UI changes, verify:

- [ ] Every interactive element has an accessible name
- [ ] Icon-only buttons have `aria-label` using `t()`
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Color contrast ≥ 4.5:1 for text (use `#1e293b` for body, not `#64748b`)
- [ ] `:focus-visible` styles are visible and distinct
- [ ] Custom modals/overlays trap focus and close on Escape
- [ ] Focus restores to trigger element after overlay closes
- [ ] Content changes are announced via `announceToScreenReader()`
- [ ] All strings use `t()` — no hardcoded text
- [ ] New strings added to all 3 locale files (de, en, fr)
- [ ] `prefers-reduced-motion` is respected
- [ ] `<html lang>` stays in sync (automatic via `useHtmlLang`, but
      verify if switching locale logic changes)
- [ ] Works on mobile viewport (375px width) — the primary use case
- [ ] Virtual keyboard doesn't block inputs — use `100dvh` and
      `useWebFrame` or similar approach for bottom-positioned UI
- [ ] Semantic HTML is used before ARIA
- [ ] List/search results use proper `role` attributes (`listbox`/`option`)
