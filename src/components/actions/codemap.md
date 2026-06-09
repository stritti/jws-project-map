# src/components/actions/

## Responsibility
Reusable action button components for navigation and sharing. Each wraps `b-button` with consistent styling, i18n labels, and event handling.

## Design
Stateless presentational components, one per file:
- **BackButton.vue** — emits `click`, uses router `go(-1)` or emits delegate. `aria-label` via `t('nav.back')`.
- **ShareButton.vue** — triggers native Web Share API (`navigator.share()`) with current URL and page title.
- **NavigateButton.vue** — opens an external link in new tab (`target="_blank"`).

Pattern: `b-button` with `variant="link"`, `size="sm"`, `pills`, icon-only with `aria-label`.

## Integration
- Used by: ProjectDetailView, ProjectDetails (ProjectListItem supplemental), SiteFooter
- Depends on: `useI18n` for labels, `b-button` (auto-imported)
