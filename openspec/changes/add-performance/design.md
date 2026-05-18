## Lazy Loading Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Component Loading Strategy                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Eager (Initial Bundle):                                             │
│  ─────────────────────────────────────────────────────────────────   │
│    HomeView.vue          ← Primary entry point                       │
│    App.vue               ← Root layout                               │
│    MainMenu.vue          ← Bottom navigation                         │
│    SearchBar.vue         ← Core UI element                           │
│    FilterPanel.vue       ← Core UI element                           │
│    CategoryBadge.vue     ← Lightweight shared component              │
│    CountryLabel.vue      ← Lightweight shared component              │
│    SiteFooter.vue        ← Lightweight                               │
│    FloatingMeta.vue      ← Lightweight                               │
│    ProjectListItem.vue   ← List view card                            │
│    ProjectDetails.vue    ← Map side panel                            │
│                                                                      │
│  Async (defineAsyncComponent):                                       │
│  ─────────────────────────────────────────────────────────────────   │
│    LocationMap.vue       ← Leaflet is heavy (~200KB)                 │
│                            Loaded only on HomeView                   │
│    MarkdownText.vue      ← vue3-markdown-it is heavy                 │
│                            Loaded only in ProjectDetailView          │
│    ProjectGallery.vue    ← Gallery + modal are heavy                 │
│                            Loaded only in ProjectDetailView          │
│                                                                      │
│  Route-level Lazy (dynamic import in router):                        │
│  ─────────────────────────────────────────────────────────────────   │
│    ProjectListView.vue   ← Chunk: "project-list"                     │
│    ProjectDetailView.vue ← Chunk: "project-detail"                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Code Splitting (Vite/Rollup)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Manual Chunk Assignments (vite.config.ts → manualChunks)            │
├──────────────────────────┬───────────────────────────────────────────┤
│  Chunk Name              │  Contents                                  │
├──────────────────────────┼───────────────────────────────────────────┤
│  vendor-vue-core         │  vue/*                                     │
│  vendor-vue-router       │  vue-router/*                              │
│  vendor-pinia            │  pinia/*                                   │
│  vendor-bootstrap-vue    │  bootstrap-vue-next/*                      │
│  vendor-bootstrap-core   │  bootstrap/*                               │
│  vendor-leaflet          │  leaflet/*                                 │
│  vendor-axios            │  axios/*                                   │
│  vendor-unplugin         │  unplugin/*                                │
├──────────────────────────┼───────────────────────────────────────────┤
│  Output Pattern:                                                       │
│    JS chunks:    assets/js/[name]-[hash].js                            │
│    Assets:       assets/[ext]/[name]-[hash].[ext]                      │
│    Sourcemaps:   DISABLED in production                                │
│    Minifier:     esbuild (not terser)                                  │
│    Warning Limit: 800 KB (chunkSizeWarningLimit)                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Suspense Usage

```
┌──────────────────────────────────────────────────────────────┐
│  HomeView.vue                                                 │
│  ─────────────────────────────────────────────────────────── │
│  <Suspense>                                                   │
│    <template #default>                                        │
│      <location-map :filtered-projects="..." :base-layer="..." />│
│    </template>                                                │
│    <template #fallback>                                       │
│      <div class="map-loading">                                │
│        <spinner /> + "Loading map..."                         │
│      </div>                                                   │
│    </template>                                                │
│  </Suspense>                                                  │
└──────────────────────────────────────────────────────────────┘
```

## Skeleton Loading Patterns

```
┌──────────────────────────────────────────────────────────────┐
│  ProjectListView — Skeleton Grid                              │
│  ─────────────────────────────────────────────────────────── │
│  Uses: b-placeholder-wrapper + b-placeholder                  │
│  Layout: 6 skeleton cards in responsive grid                  │
│    Each card: image placeholder (5 cols) + text placeholders  │
│    Animation: "wave"                                          │
│  Trigger: showLoadingSpinner from loadingStore                │
├──────────────────────────────────────────────────────────────┤
│  ProjectDetailView — Skeleton Placeholders                    │
│  ─────────────────────────────────────────────────────────── │
│  Uses: b-placeholder-wrapper + b-placeholder                  │
│  Sections: header (avatar + title), teaser (full-width),      │
│            info grid (3 placeholders), notes (3 text lines)   │
│  Trigger: loading computed from loadingStore + projectStore   │
├──────────────────────────────────────────────────────────────┤
│  LocationMap — Skeleton                                       │
│  ─────────────────────────────────────────────────────────── │
│  Uses: custom .map-skeleton with spinner                      │
│  Full viewport height, centered content                       │
│  Trigger: !mapReady (immediately false, so rarely shown)      │
└──────────────────────────────────────────────────────────────┘
```

## iOS Body Lock

```
┌──────────────────────────────────────────────────────────────┐
│  Problem:                                                     │
│  ─────────────────────────────────────────────────────────── │
│  On iOS Safari, focusing an input inside a position:fixed     │
│  container causes the document to scroll, misaligning fixed   │
│  elements (search bar, map).                                  │
│                                                               │
│  Solution:                                                    │
│  ─────────────────────────────────────────────────────────── │
│  1. Detect mobile: window.innerWidth < 768                    │
│  2. On mount: add .body-locked to <html> and <body>           │
│     → height: 100%, overflow: hidden, position: fixed,        │
│       width: 100%                                             │
│  3. On unmount: remove .body-locked                           │
│  4. Backup: visualViewport.resize listener detects keyboard   │
│     dismissal (iOS "Done" button) and resets isSearchActive   │
│                                                               │
│  CSS (App.vue):                                               │
│    html.body-locked, body.body-locked {                       │
│      height: 100% !important;                                 │
│      overflow: hidden !important;                             │
│      position: fixed !important;                              │
│      width: 100% !important;                                  │
│    }                                                          │
└──────────────────────────────────────────────────────────────┘
```

## Bundle Budget

```
┌──────────────────────────────────────────────────────────────┐
│  Thresholds (scripts/check-bundle-budget.cjs)                 │
├──────────────────────────────────────────────────────────────┤
│  Metric                  │  Limit                            │
│  ────────────────────────┼────────────────────────────────── │
│  Initial JS (gzipped)    │  ≤ 300 KB                         │
│  Async chunks (gzipped)  │  ≤ 150 KB each                    │
│  Total CSS               │  ≤ 150 KB                         │
├──────────────────────────────────────────────────────────────┤
│  Enforcement:                                                   │
│    - Local: bun run budget                                      │
│    - CI: bun run build:prod (includes budget check)            │
│    - Lighthouse CI: runs on every PR via @netlify/plugin-      │
│      lighthouse and GitHub Actions (performance.yml)           │
└──────────────────────────────────────────────────────────────┘
```

## CSS Optimization

```
┌──────────────────────────────────────────────────────────────┐
│  SCSS Configuration (vite.config.ts → css.preprocessorOptions)│
├──────────────────────────────────────────────────────────────┤
│  api: "modern-compiler"    ← Faster Sass compilation          │
│  charset: false            ← No @charset in output            │
│  quietDeps: true           ← Suppress dependency warnings     │
│                                                                    │
│  Bootstrap Custom Build:                                          │
│    - Custom primary color: #3d5e9e                               │
│    - SCSS variables overridden in assets/style-config.scss       │
│    - Only needed Bootstrap components imported (not full lib)    │
└──────────────────────────────────────────────────────────────┘
```

## Loading State Machine

```
┌──────────────────────────────────────────────────────────────┐
│  LoadingStore (Counter-based)                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  State: loading (number, starts at 0)                         │
│  Getter: showLoadingSpinner = loading > 0                     │
│                                                               │
│  updateLoading(true)  → loading++                             │
│  updateLoading(false) → loading--                             │
│                                                               │
│  This allows multiple concurrent loading operations:          │
│    op1 starts → loading = 1 → spinner shows                   │
│    op2 starts → loading = 2 → spinner still shows             │
│    op1 ends   → loading = 1 → spinner still shows             │
│    op2 ends   → loading = 0 → spinner hides                   │
│                                                               │
│  Global Loading Bar (App.vue):                                │
│    Thin 3px animated bar at top of viewport                   │
│    Gradient animation: #3d5e9e → #6a8fd4 → #3d5e9e           │
│    z-index: 10001 (above everything except skip-link)         │
└──────────────────────────────────────────────────────────────┘
```
