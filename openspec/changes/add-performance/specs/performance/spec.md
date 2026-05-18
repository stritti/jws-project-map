## Requirements

### Lazy Loading

- SHALL lazy-load `LocationMap.vue` via `defineAsyncComponent` to keep Leaflet out of the initial bundle
- SHALL lazy-load `MarkdownText.vue` via `defineAsyncComponent` in ProjectDetailView
- SHALL lazy-load `ProjectGallery.vue` via `defineAsyncComponent` in ProjectDetailView
- SHALL lazy-load route-level components (`ProjectListView`, `ProjectDetailView`) via dynamic imports in router config
- SHALL assign meaningful chunk names via webpackChunkName comments: "project-list", "project-detail"

### Code Splitting

- SHALL split vendor dependencies into separate chunks via Rollup `manualChunks`
- SHALL create dedicated chunks for: vue-core, vue-router, pinia, bootstrap-vue, bootstrap-core, leaflet, axios, unplugin
- SHALL output JS chunks to `assets/js/[name]-[hash].js`
- SHALL output assets to `assets/[ext]/[name]-[hash].[ext]`
- SHALL disable sourcemaps in production
- SHALL use esbuild minifier (not terser)

### Suspense

- SHALL wrap `LocationMap` in `<Suspense>` with a loading fallback in HomeView
- SHALL display a spinner and localized loading text in the Suspense fallback

### Skeleton Loading

- SHALL display skeleton placeholders in ProjectListView while data is loading
- SHALL display skeleton placeholders in ProjectDetailView while data is loading
- SHALL use Bootstrap's `b-placeholder-wrapper` and `b-placeholder` components with wave animation
- SHALL show 6 skeleton cards in a responsive grid for the list view
- SHALL hide skeleton loading when data is available

### iOS Viewport Management

- SHALL apply `.body-locked` class to `<html>` and `<body>` on mobile (width < 768px) to prevent document scroll when inputs are focused
- SHALL remove `.body-locked` class on component unmount
- SHALL listen to `visualViewport.resize` events to detect keyboard dismissal via iOS "Done" button
- SHALL reset search active state when visualViewport height returns to near-full

### Bundle Budget

- SHALL enforce initial JavaScript bundle ≤ 300 KB gzipped
- SHALL enforce async chunks ≤ 150 KB gzipped each
- SHALL enforce total CSS ≤ 150 KB
- SHALL run bundle budget check as part of `bun run build:prod`
- SHALL run Lighthouse CI on every PR via Netlify plugin and GitHub Actions

### Loading State

- SHALL use a counter-based loading store that supports concurrent loading operations
- SHALL show a global loading bar (3px animated gradient) at the top of the viewport when any operation is loading
- SHALL hide the loading bar only when all loading operations have completed

### CSS Optimization

- SHALL use the modern-compiler SCSS API for faster compilation
- SHALL suppress dependency warnings via `quietDeps: true`
- SHALL not emit `@charset` declarations in output
- SHALL use a custom Bootstrap SCSS build with overridden primary color (#3d5e9e)

### Performance Monitoring

- SHALL run Lighthouse CI on every PR with metrics posted as PR comments
- SHALL use `@netlify/plugin-lighthouse` for deployment-time performance checks
- SHALL use GitHub Actions (`.github/workflows/performance.yml`) for CI performance checks
