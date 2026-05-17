## 1. Foundation — Accessibility utilities and global styles

- [x] 1.1 Create `src/composables/useAccessibility.ts` with `usePageTitle()`, `announceToScreenReader()`, and `useFocusRestore()` helpers
- [x] 1.2 Create `src/assets/a11y.scss` with `.sr-only`, `.focus-visible-only`, and high-contrast utility classes
- [x] 1.3 Import `a11y.scss` in `main.ts` or `App.vue` to apply global focus-visible styles
- [x] 1.4 Add `usePageTitle()` composable usage in `App.vue` to update `<title>` on route changes via `router.afterEach`
- [x] 1.5 Bind `lang` attribute on `<html>` in `main.ts` or `App.vue` to track current i18n locale

## 2. ARIA landmarks and heading hierarchy

- [x] 2.1 Add `role="banner"` to the header area in `App.vue` (or wrap top-level navigation)
- [x] 2.2 Confirm `MainMenu.vue` nav has `role="navigation"` (already has `aria-label`, verify landmark)
- [x] 2.3 Add `role="contentinfo"` to `SiteFooter.vue`
- [x] 2.4 Add `role="complementary"` to `FilterPanel.vue` wrapper
- [x] 2.5 Audit and fix heading hierarchy in `HomeView.vue` — ensure single `<h1>`, proper `<h2>` sections
- [x] 2.6 Audit and fix heading hierarchy in `ProjectDetailView.vue` — project name as `<h1>`, sections as `<h2>`
- [x] 2.7 Audit and fix heading hierarchy in `ProjectListView.vue` — page title as `<h1>`, list heading as `<h2>`
- [x] 2.8 Audit and fix heading hierarchy in `AboutModal.vue` — modal title as heading

## 3. i18n — Accessibility translation keys

- [x] 3.1 Add `a11y.*` keys to German locale file (`de.json` or equivalent): skipToMap, mapInstructions, searchResultsAnnouncement, projectsLoaded, close, imageNotAvailable, imagePosition, zoomIn, zoomOut
- [x] 3.2 Add matching `a11y.*` keys to English locale file
- [x] 3.3 Add matching `a11y.*` keys to French locale file

## 4. Modal accessibility (a11y-modals)

- [x] 4.1 Configure `SearchModal.vue` with proper `aria-label`, `header-close-label`, and verify BootstrapVueNext focus trap
- [x] 4.2 Add `useFocusRestore()` to `SearchModal.vue` to return focus to trigger element on close
- [x] 4.3 Add `aria-hidden="true"` to main content wrapper when SearchModal is open, remove on close
- [x] 4.4 Configure `ProjectGalleryModal.vue` with proper `aria-label` and close button label
- [x] 4.5 Add `useFocusRestore()` to `ProjectGalleryModal.vue`
- [x] 4.6 Add `aria-hidden="true"` to main content wrapper when ProjectGalleryModal is open
- [x] 4.7 Configure `AboutModal.vue` with proper `aria-label` and close button label
- [x] 4.8 Add `useFocusRestore()` to `AboutModal.vue`

## 5. Map accessibility (a11y-map)

- [x] 5.1 Add "Skip to Map" link in `HomeView.vue` (visible on focus, similar to skip-to-content)
- [x] 5.2 Add `tabindex="0"` and `ref` to the Leaflet map container in `LocationMap.vue`
- [x] 5.3 Add visible focus indicator to map container when focused
- [x] 5.4 Add `@focus` handler on map container to announce keyboard instructions via `announceToScreenReader()`
- [x] 5.5 Add `aria-label` to map zoom controls (zoom in/out buttons)
- [x] 5.6 Add `aria-label` to map project markers with project name and category
- [x] 5.7 Ensure `ProjectListItem.vue` announces project name, category, and country when focused

## 6. Form accessibility (a11y-forms)

- [x] 6.1 Wrap each checkbox group in `FilterPanel.vue` with `<fieldset>` and `<legend>` for accessible grouping
- [x] 6.2 Ensure individual checkboxes in `FilterPanel.vue` have programmatically associated labels
- [x] 6.3 Add `aria-label` or associated `<label>` to `SearchBar.vue` input
- [x] 6.4 Add `aria-live="polite"` region in `FilterPanel.vue` or parent to announce filter result count changes
- [x] 6.5 Verify `FilterPanel.vue` close button has `aria-label` and is keyboard-reachable
- [x] 6.6 Ensure all form inputs show visible focus indicator (covered by global a11y.scss)

## 7. Media and image accessibility (a11y-media)

- [x] 7.1 Add `alt` attribute with project name to teaser images in `SearchModal.vue` results
- [x] 7.2 Add `alt` attribute with project name to images in `ProjectListItem.vue`
- [x] 7.3 Add `alt` attribute with project name and caption to images in `ProjectGallery.vue`
- [x] 7.4 Add `alt` attribute with project name and caption to images in `ProjectGalleryModal.vue`
- [x] 7.5 Add `aria-hidden="true"` to decorative icons in `MainMenu.vue` (verify existing)
- [x] 7.6 Add `aria-hidden="true"` to flag icons in `MainMenu.vue` language switcher (verify existing)
- [x] 7.7 Add `alt` with country name to standalone flag icons in `CountryLabel.vue`
- [x] 7.8 Add `aria-hidden="true"` to decorative icons in `CategoryBadge.vue`
- [x] 7.9 Add keyboard arrow-key navigation to `ProjectGalleryModal.vue` with image position announcement
- [x] 7.10 Add fallback placeholder with `alt="Image not available"` for broken/missing images in gallery and list components
- [x] 7.11 Verify status badges in `ProjectListItem.vue` and `SearchModal.vue` convey state via text (not color alone)

## 8. Verification and polish

- [x] 8.1 Test full keyboard navigation flow: Home → Map → List → Project Detail → Search → Filters → Gallery
- [x] 8.2 Test with VoiceOver (macOS) or NVDA (Windows): verify all landmarks, headings, and live announcements
- [x] 8.3 Verify color contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI) using browser dev tools or contrast checker
- [x] 8.4 Test `prefers-reduced-motion` still works after all changes
- [x] 8.5 Run `bun run type-check` and `bun run lint` to ensure no regressions
