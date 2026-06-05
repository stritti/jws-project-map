# src/components/

## Responsibility
Shared UI component library — reusable presentational and interactive components used across views. Includes navigation, search, filters, modals, and utility components.

## Design
Organized into subdirectories by concern:
- **actions/** — Action buttons (Back, Share, Navigate)
- **map/** — Leaflet map wrapper (LocationMap)
- **project/** — Project display components (cards, details, gallery)

Root-level shared components:
- **MainMenu.vue** — Bottom-fixed navigation bar with icons. Uses `useRouter()`, highlights active route, includes language switcher. `role="navigation"` with `aria-label="Main navigation"`.
- **SiteFooter.vue** — Footer with copyright, about link. `role="contentinfo"`.
- **SearchBar.vue** — Input + view toggle (map/list) for the map page. Handles keyboard visibility on mobile via composable.
- **SearchModal.vue** — Full-text search dialog triggered by Ctrl+K / Cmd+K. Uses `b-modal` with keyboard navigation, results as `role="listbox"`.
- **FilterPanel.vue** — Slide-out filter drawer with `b-form-checkbox-group` for state, category, country filters. `role="complementary"`.
- **FloatingMeta.vue** — Bottom-sheet expandable panel for metadata and language switching.
- **AboutModal.vue** — `b-modal` with app info, version, reload button.
- **CategoryBadge.vue** — Colored badge for project category.
- **CountryLabel.vue** — Flag icon + country name.
- **MarkdownText.vue** — Renders markdown strings via `vue3-markdown-it`.

## Flow
Components communicate upward via `emit()` and receive data via `props()`. Shared state is accessed through Pinia stores (`useProjectStore()`, `useFilterStore()`, etc.). No prop drilling beyond parent-child.

## Integration
- Used by: all views (HomeView, ProjectListView, ProjectDetailView, AboutView) and App.vue (layout shell)
- Depends on: BootstrapVueNext (auto-imported), unplugin-icons, Pinia stores, vue-i18n, vue-router
