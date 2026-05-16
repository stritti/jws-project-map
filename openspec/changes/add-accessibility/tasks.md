## 1. Foundation — Accessibility utilities and global styles

- [ ] 1.1 Create `src/composables/useAccessibility.ts` with `usePageTitle()`, `announceToScreenReader()`, and `useFocusRestore()` helpers
- [ ] 1.2 Create `src/assets/a11y.scss` with `.sr-only`, `.focus-visible-only`, and high-contrast utility classes
- [ ] 1.3 Import `a11y.scss` in `main.ts` or `App.vue` to apply global focus-visible styles
- [ ] 1.4 Add `usePageTitle()` composable usage in `App.vue` to update `<title>` on route changes via `router.afterEach`
- [ ] 1.5 Bind `lang` attribute on `<html>` in `main.ts` or `App.vue` to track current i18n locale

## 2. ARIA landmarks and heading hierarchy

- [ ] 2.1 Add `role="banner"` to the header area in `App.vue` (or wrap top-level navigation)
- [ ] 2.2 Confirm `MainMenu.vue` nav has `role="navigation"` (already has `aria-label`, verify landmark)
- [ ] 2.3 Add `role="contentinfo"` to `SiteFooter.vue`
- [ ] 2.4 Add `role="complementary"` to `FilterPanel.vue` wrapper
- [ ] 2.5 Audit and fix heading hierarchy in `HomeView.vue` — ensure single `<h1>`, proper `<h2>` sections
- [ ] 2.6 Audit and fix heading hierarchy in `ProjectDetailView.vue` — project name as `<h1>`, sections as `<h2>`
- [ ] 2.7 Audit and fix heading hierarchy in `ProjectListView.vue` — page title as `<h1>`, list heading as `<h2>`
- [ ] 2.8 Audit and fix heading hierarchy in `AboutModal.vue` — modal title as heading

## 3. i18n — Accessibility translation keys

- [ ] 3.1 Add `a11y.*` keys to German locale file (`de.json` or equivalent): skipToMap, mapInstructions, searchResultsAnnouncement, projectsLoaded, close, imageNotAvailable, imagePosition, zoomIn, zoomOut
- [ ] 3.2 Add matching `a11y.*` keys to English locale file
- [ ] 3.3 Add matching `a11y.*` keys to French locale file

## 4. Modal accessibility (a11y-modals)

- [ ] 4.1 Configure `SearchModal.vue` with proper `aria-label`, `header-close-label`, and verify BootstrapVueNext focus trap
- [ ] 4.2 Add `useFocusRestore()` to `SearchModal.vue` to return focus to trigger element on close
- [ ] 4.3 Add `aria-hidden="true"` to main content wrapper when SearchModal is open, remove on close
- [ ] 4.4 Configure `ProjectGalleryModal.vue` with proper `aria-label` and close button label
- [ ] 4.5 Add `useFocusRestore()` to `ProjectGalleryModal.vue`
- [ ] 4.6 Add `aria-hidden="true"` to main content wrapper when ProjectGalleryModal is open
- [ ] 4.7 Configure `AboutModal.vue` with proper `aria-label` and close button label
- [ ] 4.8 Add `useFocusRestore()` to `AboutModal.vue`

## 5. Map accessibility (a11y-map)

- [ ] 5.1 Add "Skip to Map" link in `HomeView.vue` (visible on focus, similar to skip-to-content)
- [ ] 5.2 Add `tabindex="0"` and `ref` to the Leaflet map container in `LocationMap.vue`
- [ ] 5.3 Add visible focus indicator to map container when focused
- [ ] 5.4 Add `@focus` handler on map container to announce keyboard instructions via `announceToScreenReader()`
- [ ] 5.5 Add `aria-label` to map zoom controls (zoom in/out buttons)
- [ ] 5.6 Add `aria-label` to map project markers with project name and category
- [ ] 5.7 Ensure `ProjectListItem.vue` announces project name, category, and country when focused

## 6. Form accessibility (a11y-forms)

- [ ] 6.1 Wrap each checkbox group in `FilterPanel.vue` with `<fieldset>` and `<legend>` for accessible grouping
- [ ] 6.2 Ensure individual checkboxes in `FilterPanel.vue` have programmatically associated labels
- [ ] 6.3 Add `aria-label` or associated `<label>` to `SearchBar.vue` input
- [ ] 6.4 Add `aria-live="polite"` region in `FilterPanel.vue` or parent to announce filter result count changes
- [ ] 6.5 Verify `FilterPanel.vue` close button has `aria-label` and is keyboard-reachable
- [ ] 6.6 Ensure all form inputs show visible focus indicator (covered by global a11y.scss)

## 7. Media and image accessibility (a11y-media)

- [ ] 7.1 Add `alt` attribute with project name to teaser images in `SearchModal.vue` results
- [ ] 7.2 Add `alt` attribute with project name to images in `ProjectListItem.vue`
- [ ] 7.3 Add `alt` attribute with project name and caption to images in `ProjectGallery.vue`
- [ ] 7.4 Add `alt` attribute with project name and caption to images in `ProjectGalleryModal.vue`
- [ ] 7.5 Add `aria-hidden="true"` to decorative icons in `MainMenu.vue` (verify existing)
- [ ] 7.6 Add `aria-hidden="true"` to flag icons in `MainMenu.vue` language switcher (verify existing)
- [ ] 7.7 Add `alt` with country name to standalone flag icons in `CountryLabel.vue`
- [ ] 7.8 Add `aria-hidden="true"` to decorative icons in `CategoryBadge.vue`
- [ ] 7.9 Add keyboard arrow-key navigation to `ProjectGalleryModal.vue` with image position announcement
- [ ] 7.10 Add fallback placeholder with `alt="Image not available"` for broken/missing images in gallery and list components
- [ ] 7.11 Verify status badges in `ProjectListItem.vue` and `SearchModal.vue` convey state via text (not color alone)

## 8. Verification and polish

- [ ] 8.1 Test full keyboard navigation flow: Home → Map → List → Project Detail → Search → Filters → Gallery
- [ ] 8.2 Test with VoiceOver (macOS) or NVDA (Windows): verify all landmarks, headings, and live announcements
- [ ] 8.3 Verify color contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI) using browser dev tools or contrast checker
- [ ] 8.4 Test `prefers-reduced-motion` still works after all changes
- [ ] 8.5 Run `bun run type-check` and `bun run lint` to ensure no regressions
