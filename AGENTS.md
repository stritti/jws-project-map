# JWS Project-Map — Agent Instructions

Compact guide for AI agents working in this repository. Only repo-specific facts that are easy to miss or get wrong.

## Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3.5 + Composition API + `<script setup>` |
| Language | TypeScript 5.9 (strict) |
| Build | Vite 7 |
| Package manager | **Bun** (lockfile: `bun.lock`) |
| Router | Vue Router 5 (not v4) |
| State | Pinia 3 + `pinia-plugin-persistedstate` |
| UI | Bootstrap 5.3 + BootstrapVueNext 0.44 (auto-imported) |
| Maps | Leaflet 1.9 + `@vue-leaflet/vue-leaflet` 0.10 |
| Backend | NocoDB v3 REST API |
| CSS | SCSS (Bootstrap custom build with `#3d5e9e` primary) |
| Icons | `unplugin-icons` (Iconify, auto-install) + `flag-icons` |
| PWA | `vite-plugin-pwa` (auto-update) |
| Type-check | `vue-tsc --noEmit` (not `tsc`) |

## Commands (all use `bun`)

```sh
bun install              # install deps
bun run dev              # dev server
bun run build            # type-check + build (parallel via npm-run-all)
bun run build:prod       # build + bundle budget check
bun run type-check       # vue-tsc --noEmit
bun run lint             # eslint .
bun run preview          # vite preview (built output)
bun run budget           # bundle budget check script
bun run generate-pwa-assets  # regenerate PWA icons from source image
bun run mcp              # run the stdio MCP server (for AI tooling)
```

**Build order matters:** CI runs `bun run lint` → `bun run build` → `bun test`. No test infrastructure exists today — `bun test` is a no-op unless tests are added.

**Performance CI** (`.github/workflows/performance.yml`) uses `npm ci` (not Bun) because `@lhci/cli` is Node-native. Always runs `npm run build:prod` (build + bundle budget).

## Architecture

```
src/
├── App.vue              # Root layout: router-view, MainMenu (bottom-fixed), SiteFooter, SearchModal
├── main.ts              # Pinia init, store preloading, app mount, shell fade-out
├── features/projects/   # The only feature module
│   ├── repositories/    # NocoDB data access (RawProjectRecord)
│   ├── services/        # Domain service (transform RawProjectRecord → Project interface)
│   ├── stores/          # Pinia store with persisted state + cache logic
│   └── types/           # (empty — types in src/interfaces/)
├── services/            # Shared services
│   ├── api/http.client.ts   # Axios instance (baseURL + xc-token from env)
│   ├── nocodb.service.ts    # Generic NocoDB v3 CRUD
│   ├── category.service.ts
│   └── country.service.ts
├── stores/              # Global Pinia stores (category, country, loading, search)
├── components/          # Shared components (map/, project/*, actions/*, MainMenu, etc.)
├── composables/         # useWebFrame, useGeoTags, useProjectSearch
├── interfaces/          # Project, Category, Country, Attachment, LinkedRecord
├── assets/              # style-config.scss (Bootstrap custom build)
└── views/               # HomeView, ProjectListView, ProjectDetailView, AboutView
```

### Key architectural facts

- **No global Bootstrap component registration.** All Bootstrap components are auto-imported at build time by `unplugin-vue-components` with `BootstrapVueNextResolver`. Import paths are never needed. This generates `components.d.ts` — never edit it manually.
- **Icons** are auto-imported by `unplugin-icons`. Usage: `<IconBiList />` for Bootstrap Icons, `<IconMdiAccount />` for Material Design Icons, etc. Icons resolve automatically from `@iconify-json/bi` (already installed).
- **`@` path alias** → `src/` (configured in both Vite and tsconfig).
- **NocoDB API is v3.** All requests go to `/api/v3/data/{baseId}/{tableId}/records`. The `baseId` is from `VITE_APP_NOCODB_BASE_ID` env var (or passed to constructor). Table IDs (`mdctuswlmsfvi8i`) are hardcoded in the repository layer.
- **Store preloading in `main.ts`** — `useProjectStore().preloadMapData()`, `useCategoryStore().load()`, `useCountryStore().load()` all fire eagerly before mount. This means stores are populated before any route renders.
- **`LocationMap` component is lazy-loaded** via `defineAsyncComponent` in `HomeView.vue`. Leaflet stays out of the initial bundle.
- **Persisted Pinia stores** — `project` store persists `{projects, mapProjects, initialized, lastFetched}` via `pinia-plugin-persistedstate`. The `category` and `country` stores explicitly set `persist: false`.
- **Two-tier data loading**: Map data (minimal fields: name, coords, category) loads first via `preloadMapData()`. Full project data (notes, links, gallery) loads after via `load()`.

## Environment variables (`.env.local`)

```
VITE_APP_NOCODB_URL=<base-url>
VITE_APP_NOCODB_TOKEN=<xc-token>
VITE_APP_NOCODB_BASE_ID=<base-id>
```

These are required at build time. No defaults.

## Code quality

- **ESLint** — flat config (`eslint.config.js`), TypeScript + Vue plugins. Key rule overrides: `vue/multi-word-component-names: off`, `vue/no-v-html: off`, `@typescript-eslint/no-explicit-any: warn`, `no-unused-vars: warn`.
- **Prettier** — empty config (defaults only).
- **TypeScript** — strict mode enabled. `skipLibCheck: true`.
- **No tests exist** — no vitest config, no test/spec files. The CI build workflow has a conditional `bun test` step that only runs when `run_tests=true` is set (disabled by default).

## Deployment

- **Netlify** — SPA with `/* → /index.html 200` redirect (both `public/_redirects` and `netlify.toml`).
- Build command: `npm run build:prod` (build + bundle budget check).
- Bundle budget thresholds (in `scripts/check-bundle-budget.cjs`): initial JS ≤ 300 kB gzipped, async chunks ≤ 150 kB, total CSS ≤ 150 kB.
- Lighthouse CI runs on every PR via `@netlify/plugin-lighthouse` and GitHub Actions (`performance.yml`), with metrics posted as PR comments.

## NocoDB

- Uses **NocoDB v3 API** (`/api/v3/data/{baseId}/{tableId}/records`).
- The `NocoDBService` class handles: `list` (with pagination, sorting, field filtering, viewId), `read` (single record), `create`, `update`, `delete`, `count`.
- `list()` automatically handles offset→page conversion (offset must be a multiple of limit).
- The raw response shape is `RawProjectRecord` with `{ id, fields: { Name, Latitude, ... } }` (NocoDB v2-style wrapper, lowercase `id`). The service layer transforms this into the clean `Project` interface.
- The project repository hardcodes `tableId = "mdctuswlmsfvi8i"` and `viewId = "vwlnl4t095iifqc9"`.

## MCP Server

`scripts/mcp-server.ts` provides an stdio MCP server with tools for project structure introspection, env key listing, NocoDB queries, and Vue component scaffolding. Run with `bun run mcp`. Intended for AI tooling contexts, not normal development.
