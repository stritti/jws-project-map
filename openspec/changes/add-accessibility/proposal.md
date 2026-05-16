## Why

The application currently has partial accessibility support (skip-link, reduced-motion, some aria attributes) but lacks comprehensive WCAG 2.1 AA compliance. Screen reader users, keyboard-only users, and users with visual or motor impairments cannot reliably navigate the map, search modal, filter panel, or project details. Adding systematic accessibility ensures the project map is usable by everyone and meets legal requirements for public-sector digital services.

## What Changes

- Add `lang` attribute binding on `<html>` that tracks the active i18n locale
- Update page `<title>` on every route change for screen reader context
- Add global focus-visible styles for all interactive elements
- Ensure all images have meaningful `alt` text (project gallery, teaser images, country flags)
- Add ARIA landmarks (`banner`, `navigation`, `complementary`, `contentinfo`) across the layout
- Implement focus trap and restore in all modals (SearchModal, ProjectGalleryModal, AboutModal)
- Make the Leaflet map keyboard-accessible with a skip-to-map link and keyboard controls hint
- Add `aria-describedby`, `aria-labelledby`, and proper form labels to FilterPanel checkboxes
- Enforce heading hierarchy (h1 → h2 → h3) across all views
- Add `aria-live` regions for dynamic content updates (loading states, filter results count)
- Ensure color contrast meets WCAG AA (4.5:1 text, 3:1 UI components)
- Add `role` and `aria-*` attributes to CountryLabel, CategoryBadge, and other shared components
- Document accessibility patterns in a reusable composable (`useAccessibility`)

## Capabilities

### New Capabilities
- `a11y-core`: Foundational accessibility infrastructure — lang attribute, page titles, focus-visible styles, ARIA landmarks, heading hierarchy enforcement
- `a11y-modals`: Focus trap, focus restore, and screen reader announcements for all modal dialogs
- `a11y-map`: Keyboard navigation support for the Leaflet map, skip-to-map link, and accessible map controls
- `a11y-forms`: Proper form labeling, aria-describedby, and accessible checkbox groups in FilterPanel and SearchBar
- `a11y-media`: Meaningful alt text for all images, decorative icon handling, and accessible gallery navigation

### Modified Capabilities
<!-- No existing specs to modify — this is a greenfield spec area -->

## Impact

- **Components affected**: `App.vue`, `MainMenu.vue`, `SearchModal.vue`, `FilterPanel.vue`, `ProjectGalleryModal.vue`, `AboutModal.vue`, `LocationMap.vue`, `ProjectGallery.vue`, `ProjectListItem.vue`, `CountryLabel.vue`, `CategoryBadge.vue`, `SiteFooter.vue`, `SearchBar.vue`, `ProjectDetails.vue`, `ProjectListView.vue`, `HomeView.vue`, `ProjectDetailView.vue`
- **New files**: `src/composables/useAccessibility.ts`, `src/assets/a11y.scss` (focus-visible, sr-only, contrast utilities)
- **Dependencies**: No new dependencies needed — all changes use native HTML/ARIA and existing Vue/BootstrapVueNext APIs
- **i18n**: New translation keys for accessibility labels (skip links, map instructions, screen reader announcements) in `de`, `en`, `fr`
- **No breaking changes**: All additions are progressive enhancements; existing functionality is preserved
