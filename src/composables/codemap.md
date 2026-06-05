# src/composables/

## Responsibility
Reusable Vue Composition API composables that encapsulate cross-cutting concerns: accessibility, virtual keyboard, geo metadata, attachments, and search logic.

## Design
Five composables:

- **useAccessibility.ts** — Three exports:
  - `announceToScreenReader(msg)` — singleton `aria-live="polite"` region
  - `useFocusRestore()` — save/restore focus for modals/panels
  - `usePageTitle(router)` — updates `document.title` on route changes
  - `useHtmlLang(i18n)` — binds `<html lang>` to current locale
- **useWebFrame.ts** — Mobile virtual keyboard handling. Moves fixed-position search bar to top of viewport when input is focused, using `visualViewport` API. Returns to bottom on blur.
- **useGeoTags.ts** — Injects/updates geo meta tags (`geo.position`, `ICBM`) for SEO based on current project or map center.
- **useAttachment.ts** — Utility for building attachment/thumbnail URLs from NocoDB data.
- **useProjectSearch.ts** — Full-text search across projects by name, description, notes. Used by SearchModal and HomeView search.

## Flow
Composables are instantiated within component `setup()` (or called at module level for singletons like `announceToScreenReader`). They return reactive refs and methods that the component wires into its template.

## Integration
- Used across: App.vue (usePageTitle, useHtmlLang), HomeView (useWebFrame, useProjectSearch), ProjectDetailView (useGeoTags), SearchModal (useProjectSearch)
- Dependencies: vue-router, vue-i18n, Pinia stores
