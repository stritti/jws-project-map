# Repository Atlas: JWS Project Map

## Project Responsibility
A Vue 3.5 + TypeScript single-page application that visualises development cooperation projects on an interactive Leaflet map. Data is served by a NocoDB v3 REST API backend. The app supports full-text search, filtering by status/category/country, and includes multi-language support (DE/EN/FR).

## System Entry Points
- `pages/+onRenderHtml.ts` — Vike server/prerender entry: renders the app (vue-router on memory history) and merges unhead tags into the `index.html` shell template.
- `pages/+onRenderClient.ts` — Vike client entry: creates/mounts the app (Pinia, vue-i18n, unhead, vue-router on web history), preloads stores, registers the PWA service worker.
- `src/app.ts` — Shared app factory used by both render hooks.
- `src/App.vue` — Root component: `<router-view>` with persistent MainMenu (bottom navbar), SiteFooter, and SearchModal overlay.
- `index.html` — HTML shell template (read as `?raw` by `pages/+onRenderHtml.ts`; Vike injects the client entry itself).
- `package.json` — Dependency manifest and run scripts.

## Key Configuration
- `vite.config.ts` — Vite 8 build config with the Vike plugin, `@` alias, SCSS, PWA plugin, component auto-import. Vike output: `dist/client` (static assets + prerendered HTML), `dist/server` (preview only).
- `pages/+config.ts` — Vike config: `prerender: true` for the static routes; `pages/project/@projectId/+prerender.ts` opts the dynamic route out.
- `tsconfig.json` — TypeScript strict mode, `@` path alias, `skipLibCheck: true`.
- `eslint.config.js` — Flat ESLint config with Vue 3 + TypeScript rules.
- `AGENTS.md` — Compact repo-specific guide for AI agents (this file).

## Directory Map

| Directory | Responsibility Summary | Detailed Map |
|-----------|----------------------|--------------|
| `pages/` | Vike pages & hooks: `+Page.vue` wrappers around `src/App.vue`, `+onRenderHtml.ts`/`+onRenderClient.ts`, `+config.ts` (prerender). | — |
| `src/` | Application source root. All runtime code organized by layer. | [View Map](src/codemap.md) |
| `src/views/` | Page-level route components (HomeView, ProjectListView, ProjectDetailView, AboutView). | [View Map](src/views/codemap.md) |
| `src/components/` | Shared UI component library — nav, map, project cards, search, filters, modals. | [View Map](src/components/codemap.md) |
| `src/components/actions/` | Reusable action buttons (Back, Share, Navigate). | [View Map](src/components/actions/codemap.md) |
| `src/components/map/` | Leaflet map wrapper (lazy-loaded LocationMap). | [View Map](src/components/map/codemap.md) |
| `src/components/project/` | Project display components (cards, details, gallery). | [View Map](src/components/project/codemap.md) |
| `src/features/projects/` | Feature module: data access, domain service, and state management for projects. | [View Map](src/features/projects/codemap.md) |
| `src/features/projects/repositories/` | NocoDB data access layer (API queries, pagination, field filtering). | [View Map](src/features/projects/repositories/codemap.md) |
| `src/features/projects/services/` | Domain transformation: RawProjectRecord → Project interface. | [View Map](src/features/projects/services/codemap.md) |
| `src/features/projects/stores/` | Pinia store with caching, persistence, and two-tier data loading. | [View Map](src/features/projects/stores/codemap.md) |
| `src/services/` | Shared API services (NocoDB CRUD, category, country). | [View Map](src/services/codemap.md) |
| `src/services/api/` | Axios HTTP client configuration. | [View Map](src/services/api/codemap.md) |
| `src/stores/` | Global Pinia stores (category, country, filter, search, loading). | [View Map](src/stores/codemap.md) |
| `src/composables/` | Vue composables (a11y, web frame, geo tags, search, attachment). | [View Map](src/composables/codemap.md) |
| `src/router/` | Vue Router 5 route configuration with lazy-loaded views + `createAppRouter()` factory (memory history on SSR). | [View Map](src/router/codemap.md) |
| `src/plugins/` | Vue plugin setup (vue-i18n). | [View Map](src/plugins/codemap.md) |
| `src/interfaces/` | TypeScript interfaces for domain entities (Project, Category, Country, etc.). | [View Map](src/interfaces/codemap.md) |
| `src/types/` | Ambient type declarations for third-party modules. | [View Map](src/types/codemap.md) |
| `src/assets/` | SCSS stylesheets (Bootstrap custom build, a11y utilities, design tokens). | [View Map](src/assets/codemap.md) |

## Data Flow Overview
```
NocoDB API → Repository (raw records) → Service (transform) → Store (Pinia reactive state) → Components (Vue render)
                                                                                             ↓
                                                                                  User interacts → router/navigation
```

## Architecture Pattern
Feature-sliced monolith with layered feature modules. Shared infrastructure (services, stores, composables) lives in root `src/` directories. Business logic lives in `src/features/`.
