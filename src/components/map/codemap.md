# src/components/map/

## Responsibility
Interactive map component powered by Leaflet. Renders project pins with clustering, supports base layer switching (carto/satellite/OSM), and provides keyboard accessibility.

## Design
Single component: `LocationMap.vue`. Lazy-loaded via `defineAsyncComponent` in HomeView — Leaflet stays out of the initial JS bundle.

Uses `@vue-leaflet/vue-leaflet` 0.10 (`LMap`, `LTileLayer`, `LMarker`, `LTooltip`). Key features:
- **Pin clustering** — groups nearby pins at low zoom levels
- **Base layer toggle** — carto (default), satellite, OSM via `baseLayer` prop
- **Zoom-to-fit** — `fitBounds` on project data changes
- **Keyboard a11y** — `role="region"`, `aria-label`, dynamic `aria-label` on zoom controls, `focus-visible` styles, keyboard instructions announced via `aria-live` on focus
- **Map type toggle** — rendered by HomeView, passed as prop

## Flow
1. HomeView provides `mapProjects[]` (from store) and `baseLayer` selection
2. LocationMap renders tiles + markers with clustering
3. On marker click, emits `select-project` with project ID
4. HomeView handles navigation to ProjectDetailView or opens ProjectDetails panel
5. Map announces its description to screen readers on initial focus

## Integration
- Consumed by: HomeView (lazy import)
- Depends on: Leaflet 1.9, `@vue-leaflet/vue-leaflet` 0.10
- Store data flows through props (not direct store access)
