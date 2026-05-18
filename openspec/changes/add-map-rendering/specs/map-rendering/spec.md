## Requirements

### Map Rendering

- SHALL render a Leaflet map as the primary view on the home page
- SHALL support two base tile layers: OpenStreetMap and Esri Satellite
- SHALL allow toggling between base layers via the FilterPanel map-type toggle
- SHALL constrain the viewport to West Africa using maxBounds

### Marker Layers

- SHALL render project markers in three separate layer groups: finished, under construction, planned
- SHALL display layer group names with localized labels including project counts
- SHALL use category-specific pin images resolved from `/pins/{category-names}.png`
- SHALL fall back to `/pins/default.png` when no category is available
- SHALL apply state-specific CSS filters to markers (opacity/grayscale)

### Marker Interaction

- SHALL open the ProjectDetails side panel when a marker is clicked
- SHALL highlight the selected marker with a scale transform and drop shadow
- SHALL show tooltips on markers only when zoom level is greater than 7
- SHALL close the side panel when the user dismisses it

### Performance

- SHALL use the Canvas renderer for marker rendering
- SHALL use v-memo directives on markers to prevent unnecessary re-renders
- SHALL cache pin URLs in a global Map to avoid repeated string construction
- SHALL cache marker CSS classes in a global Map
- SHALL debounce bounds calculation at 200ms to avoid rapid fitBounds calls
- SHALL debounce zoom events at 100ms
- SHALL sample locations (stride = len/1000) when calculating bounds for datasets over 1000 points
- SHALL disable zoom and fade animations for performance
- SHALL use hardware acceleration CSS transforms on the map container

### Loading States

- SHALL show a skeleton spinner while the map component is initializing
- SHALL show a "Loading project data..." indicator when the map is ready but pins are not yet loaded
- SHALL render tiles immediately without waiting for project data

### Bounds Management

- SHALL calculate bounds from all visible project locations
- SHALL cache calculated bounds with a key that includes a version number to invalidate on filter changes
- SHALL apply fitBounds with padding [50, 50] and no animation
- SHALL use default West Africa bounds when no project locations are available

### Mobile

- SHALL hide zoom controls on screens below 768px
- SHALL enable touch zoom
- SHALL support scroll wheel zoom on desktop

### Accessibility

- SHALL have a tabindex="0" and role="region" on the map container
- SHALL announce keyboard instructions to screen readers when the map receives focus
- SHALL have aria-labels on zoom controls (zoomIn, zoomOut)
- SHALL have a visible focus ring on the map container when focused via keyboard
