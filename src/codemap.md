# src/

## Responsibility
Application source code root. Contains all runtime code organized by architectural layer.

## Structure

| Directory | Responsibility |
|-----------|---------------|
| `components/` | Shared UI components (BootstrapVueNext, Leaflet map, project cards, nav, search) |
| `composables/` | Vue composables for cross-cutting concerns (a11y, geotags, web frame, search) |
| `features/` | Feature modules (currently only `projects/` with layered architecture) |
| `interfaces/` | TypeScript type definitions for domain entities |
| `plugins/` | Vue plugin configuration (vue-i18n) |
| `router/` | Vue Router 5 route definitions |
| `services/` | API services (NocoDB v3 CRUD, category, country) |
| `stores/` | Global Pinia stores (category, country, filter, search, loading) |
| `views/` | Page-level route components |
| `assets/` | SCSS stylesheets (Bootstrap custom build, a11y, design tokens) |
| `locales/` | i18n JSON files (de, en, fr) — excluded from codemap |

## Architecture Pattern
Feature-sliced: shared infrastructure in root dirs, domain logic in `features/*/`. Data flows: View → Store → Repository → Service → NocoDB API, and back via reactive Pinia state.

## Key Files
- `app.ts` — Shared app factory (Pinia, i18n, unhead, vue-router) used by both Vike render hooks (`pages/+onRenderHtml.ts`, `pages/+onRenderClient.ts`)
- `App.vue` — Root component: layout shell with router-view, MainMenu, SiteFooter, SearchModal
