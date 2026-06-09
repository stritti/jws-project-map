# src/views/

## Responsibility
Page-level view components — one per route. Each view composes shared components into a complete page layout and coordinates data loading via Pinia stores.

## Design
Four views:

- **HomeView.vue** (`/`) — Primary view. Full-screen Leaflet map with overlaid search bar, map type toggle, and search results dropdown. Lazily loads LocationMap. Handles virtual keyboard via visualViewport API. Includes skip-to-map link for keyboard users. Projects loaded from store's `mapProjects`.

- **ProjectListView.vue** (`/list`, redirects to `/`) — Filterable/sortable list of ProjectListItem cards. Uses FilterPanel, SearchBar. Infinite scroll behavior. Virtual keyboard handling same pattern as HomeView. Reads from store's `projects`.

- **ProjectDetailView.vue** (`/project/:projectId`) — Full project detail page. URL params drive which project to display. Shows gallery (ProjectGallery), markdown notes (MarkdownText), project link button, floating back button. Updates geo meta tags via `useGeoTags`. Uses `usePageTitle` for dynamic title.

- **AboutView.vue** (`/about`) — Static info page. Displays app version, data source link, PWA update notice, reload button.

## Flow
1. Router resolves URL → lazy-loads view component
2. View's `setup()` accesses Pinia stores for data
3. View renders shared components with props
4. User interactions emit events up to the view, which coordinates store actions or navigation

## Integration
- Consumed by: `src/router/index.ts` (lazy imports)
- Each view composes: components from `src/components/`, data from `src/features/projects/stores/`, composables from `src/composables/`
