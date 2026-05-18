## Why

The application employs extensive performance optimizations across multiple layers: lazy loading of heavy components (Leaflet, Markdown renderer, Gallery), manual code splitting via Rollup `manualChunks`, Vue `Suspense` for async components, skeleton loading states, iOS-specific body lock to prevent viewport shifts, and strict bundle budget enforcement. This capability needs documentation to ensure performance characteristics are maintained and future changes don't regress load times or bundle size.

## What Changes

- Document the lazy loading strategy: which components are async-loaded and why
- Specify the Vite/Rollup code splitting configuration with manual chunk assignments
- Document the Suspense usage for async component fallbacks
- Specify the skeleton loading patterns across views
- Document the iOS body lock mechanism for fixed-position elements during keyboard interaction
- Specify the bundle budget thresholds and CI enforcement
- Document the CSS optimization strategy (SCSS quietDeps, modern-compiler API)

## Capabilities

### New Capabilities
- `performance`: Lazy loading, code splitting, Suspense, skeleton loading, iOS viewport management, and bundle budget enforcement

## Impact

- **Build config affected**: `vite.config.ts`
- **Components affected**: `HomeView.vue`, `ProjectDetailView.vue`, `ProjectGallery.vue`, `MarkdownText.vue`, `LocationMap.vue`
- **CI affected**: `scripts/check-bundle-budget.cjs`, `.github/workflows/performance.yml`
- **No breaking changes**: Documentation-only change
