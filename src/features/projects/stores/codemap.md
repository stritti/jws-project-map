# src/features/projects/stores/

## Responsibility
State management for the project domain. Owns the single source of truth for all project data, manages cache lifecycle, and provides reactive state to UI components.

## Design
Pinia store (`project.store.ts`) with `defineStore` + Composition API syntax. Uses `pinia-plugin-persistedstate` to persist `{projects, mapProjects, initialized, lastFetched}` across sessions (localStorage key: `project`).

Key state shape:
- `projects: Project[]` — full project dataset
- `mapProjects: Project[]` — lightweight set for map pins (name, coords, category only)
- `initialized: boolean`
- `lastFetched: number` — timestamp for 6-hour cache invalidation
- `loading: boolean`

Uses `markRaw` on Leaflet-related objects to prevent Vue reactivity overhead. Implements client-side caching with stale-while-revalidate pattern.

## Flow
1. `preloadMapData()` fires eagerly in `main.ts` — fetches minimal fields from NocoDB via repository, transforms via service, stores in `mapProjects`
2. `load()` fetches full project data — similar pipeline, stores in `projects`
3. Cache check: if `lastFetched < 6h old` and `initialized`, skip fetch
4. Components access via `useProjectStore()` — map reads `mapProjects`, list/detail read `projects`
5. Search and filter operations work against the in-memory store (not API)

## Integration
- Consumes: `projectRepository` (NocoDB data access)
- Consumes: `projectService` (transform RawProjectRecord → Project)
- Consumed by: HomeView, ProjectListView, ProjectDetailView, SearchModal, composables (useProjectSearch, useAccessibility)
