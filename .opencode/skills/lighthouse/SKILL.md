---
name: lighthouse
description: >-
  Lighthouse performance auditing and bundle budget verification for the JWS
  Project Map. Use when asked to audit performance, optimize bundles, fix
  Lighthouse regressions, or verify that builds meet budget thresholds.
---

# Lighthouse Performance Skill — JWS Project Map

Guide for running Lighthouse CI locally, interpreting results, and fixing
common performance issues in this project.

## Prerequisites

Lighthouse requires **Chrome** to run. CI (GitHub Actions) provides it
automatically. For local testing:

```sh
# Install Chromium for Lighthouse (choose one)
npx puppeteer browsers install chrome
# or
brew install --cask google-chrome
```

## Quick Start

```sh
# 1. Build the app (type-check + vite build + bundle budget)
npm run build:prod

# 2. Run Lighthouse CI against the static dist
npx lhci autorun \
  --collect.staticDistDir=dist \
  --upload.target=filesystem \
  --upload.outputDir=.lighthouseci

# 3. View the HTML report
open .lighthouseci/lhr-*.html
```

This mimics exactly what the CI workflow (`.github/workflows/performance.yml`)
does. Reports are saved as HTML files in `.lighthouseci/` for local review.

### Troubleshooting: Chrome not found

If you see `❌ Chrome installation not found`, install it:

```sh
# Option A: Install Chromium via Puppeteer
npx puppeteer browsers install chrome

# Option B: Install system Chrome (Ubuntu/Debian)
sudo apt-get install google-chrome-stable

# Option C: Tell lhci where Chrome is
npx lhci autorun \
  --collect.staticDistDir=dist \
  --collect.chromePath=$(which google-chrome-stable) \
  --upload.target=filesystem
```

## Project Configuration

### `lighthouserc.json`

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "total-byte-weight": ["warn", { "maxNumericValue": 500000 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 300 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

All thresholds are `warn` level — the CI reports metrics but does not fail
the build. This gives visibility into trends without blocking PRs.

### Bundle Budget (`scripts/check-bundle-budget.cjs`)

| Chunk Type | Max Gzipped |
|---|---|
| Initial JS (`index-*`, vendor chunks) | 300 kB |
| Async chunks | 150 kB each |
| Total CSS | 150 kB |

The budget check runs as part of `bun run build:prod`.

## Interpreting Lighthouse Reports

Focus on these 4 metrics (asserted in CI):

| Metric | Target | What it measures |
|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2500 ms | Perceived load speed — when the main content is visible |
| **TBT** (Total Blocking Time) | ≤ 300 ms | Interactivity readiness — sum of long tasks on main thread |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Visual stability — unexpected layout shifts during load |
| **Total Byte Weight** | ≤ 500 kB | Network cost — total resources transferred |

## Common Performance Issues & Fixes

### 1. LCP too high

**Causes:**
- Hero image not optimized or too large
- Render-blocking CSS/JS
- Slow API responses blocking content render

**Fixes:**
- Check that `vite-plugin-pwa` precaches critical assets
- Ensure Leaflet CSS is lazy-loaded (it's bundled with `LocationMap` async chunk)
- Verify that store preloading (`main.ts`) doesn't block rendering
- If Leaflet map is the LCP element, consider adding a skeleton/blur-up placeholder

### 2. TBT too high

**Causes:**
- Heavy JavaScript execution on load
- Pinia store hydration from persisted state
- Large Leaflet marker clustering on first render

**Fixes:**
- Review persisted state size in `project` store — large caches deserialize on load
- Ensure `LocationMap` stays lazy-loaded (`defineAsyncComponent`)
- Check if `leaflet.markercluster` processing can be deferred with `requestIdleCallback`
- Audit third-party scripts in the bundle

### 3. CLS too high

**Causes:**
- Images without explicit `width`/`height`
- Dynamic content (search results, project cards) pushing layout
- Font swap causing text reflow

**Fixes:**
- Add explicit dimensions to `b-card-img` and Leaflet map container
- Set `min-height` on dynamic content areas (search results list, project list)
- Font is loaded from Google Fonts via `@import` in SCSS — ensure `font-display: swap` is set and consider `size-adjust` fallbacks
- The map container (`#map-container`) should have a fixed `height` or `aspect-ratio` to prevent CLS

### 4. Total Byte Weight too high

**Causes:**
- Large images in project gallery
- Unoptimized vendor bundles
- Too many icon sets loaded

**Fixes:**
- Lazy-load gallery images (native `loading="lazy"`)
- Check Vite bundle visualizer output for duplicate dependencies
- Project gallery images should be served at appropriate sizes (not full-resolution originals)

## Bundle Analysis

To see what's taking up space:

```sh
# Build with stats
npx vite build --mode production

# Or add `rollup-plugin-visualizer` to see a treemap
# (currently not installed — add to vite.config.ts if needed)
```

## CI Integration

The `.github/workflows/performance.yml` workflow:

1. Checks out code
2. Installs deps with Bun
3. Runs `bun run build:prod` (type-check + build + bundle budget)
4. Runs `lhci autorun` on `dist/`
5. Uploads HTML reports as CI artifacts
6. Extracts 4 key metrics and posts them as a PR comment

To trigger manually: push a branch and open a PR, or push to `main`.

## Adding New Assertions

Edit `lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "performance": ["warn", { "minScore": 0.8 }],
        "accessibility": ["warn", { "minScore": 0.9 }],
        "best-practices": ["warn", { "minScore": 0.9 }],
        "seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

Use `"error"` instead of `"warn"` to make assertions fail the build.
