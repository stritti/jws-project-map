## Why

The interactive map is the primary feature of the application. It renders project locations across West Africa using Leaflet, with category-specific pins, state-based layer grouping, satellite/OSM toggle, and extensive performance optimizations. This capability needs formal documentation to ensure future changes don't regress map behavior, performance, or accessibility.

## What Changes

- Document the Leaflet map rendering pipeline: component initialization, tile layer management, marker rendering, and bounds calculation
- Specify the three-layer architecture (finished, under construction, planned) with toggleable overlay groups
- Document the performance optimization strategy: Canvas renderer, v-memo directives, debounced zoom events, pin URL caching, bounds caching with version invalidation
- Specify the satellite vs OSM base layer toggle behavior
- Document the marker interaction model: click → side panel (ProjectDetails), tooltip display at zoom > 7
- Specify the custom pin URL resolution: `/pins/{category-names}.png` with category-based cache key generation
- Document the bounds calculation: fitBounds with padding, debounced at 200ms, cached per location count + version
- Specify the maxBounds constraint for West Africa region
- Document the mobile-specific behavior: zoom controls hidden on mobile, touch zoom enabled, scroll wheel zoom enabled
- Specify the loading states: map skeleton → tiles → pins loading indicator → pins ready

## Capabilities

### New Capabilities
- `map-rendering`: Leaflet map rendering, tile layers, marker management, performance optimizations, and interaction handling

## Impact

- **Components affected**: `LocationMap.vue` (primary), `ProjectDetails.vue` (side panel)
- **Dependencies**: Leaflet 1.9, `@vue-leaflet/vue-leaflet` 0.10
- **No breaking changes**: Documentation-only change
