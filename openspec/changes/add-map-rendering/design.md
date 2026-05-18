## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LocationMap.vue                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LMap (Leaflet)                                       │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  LTileLayer (satellite OR osm)                  │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  LLayerGroup "Finished"                         │   │   │
│  │  │    LMarker × N  (v-memo optimized)              │   │   │
│  │  │      LIcon (cached pin URL)                     │   │   │
│  │  │      LTooltip (only if zoom > 7)                │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  LLayerGroup "Under Construction"               │   │   │
│  │  │    LMarker × N  (v-memo optimized)              │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  LLayerGroup "Planned"                          │   │   │
│  │  │    LMarker × N  (v-memo optimized)              │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ProjectDetails (side panel)                          │   │
│  │  Shows on marker click, closes on dismiss             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Performance Strategy

```
┌──────────────────┬──────────────────────────────────────────┐
│  Technique       │  Implementation                          │
├──────────────────┼──────────────────────────────────────────┤
│  Canvas renderer │  L.canvas({ padding: 0.5, tolerance: 5}) │
│  v-memo          │  [id, lat, lng, selected, zoom > 7]      │
│  Pin URL cache   │  Map<string, string> (global)            │
│  Marker class    │  Map<string, string> (global)            │
│  Bounds cache    │  Map<string, LatLngBounds> + version     │
│  Zoom debounce   │  100ms timeout on zoomend                │
│  Bounds debounce │  200ms timeout on location change        │
│  Lazy loading    │  defineAsyncComponent(LocationMap)       │
│  Hardware accel  │  translate3d, willChange, backfaceHidden │
│  Tooltip lazy    │  v-if="currentZoom > 7"                  │
│  Sampling        │  stride = len/1000 when len > 1000       │
└──────────────────┴──────────────────────────────────────────┘
```

## Pin URL Resolution

```
Project.categories → category[].fields.Name → lowercase, joined with "-"
                                                    ↓
                                        /pins/{category-names}.png
                                                    ↓
                                        PIN_CACHE[cacheKey] → URL
```

Cache key: `{project.id}-{category.ids.join("-")}`

## Bounds Calculation

```
locations change → debounce 200ms → calculate bounds
                                                    ↓
                              cacheKey = `bounds-v{version}-{count}`
                                                    ↓
                              if cached → use cached bounds
                              else → iterate locations (with sampling)
                                     → fitBounds(padding: [50,50], animate: false)
                                     → cache result
```

## Map Configuration

| Setting | Value |
|---------|-------|
| CRS | EPSG:4326 |
| Min Zoom | 4 |
| Max Zoom | 17 |
| Zoom Snap | 0.5 |
| Wheel Px Per Zoom Level | 60 |
| Scroll Wheel Zoom | true |
| Touch Zoom | true |
| Zoom Animation | false |
| Marker Zoom Animation | false |
| Fade Animation | !touch device |
| Update When Zooming | false |
| Update When Idle | true |
| Prefer Canvas | true |

## MaxBounds (West Africa)

```
SW: [-14.6, 5.9]
NE: [8.9490075, 11.322326]
```

## Tile Layers

| Layer | URL | Attribution |
|-------|-----|-------------|
| Satellite | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` | Esri |
| OSM | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | OpenStreetMap contributors |

## Marker States

| State | CSS Filter |
|-------|-----------|
| finished | opacity(1) |
| under-construction | grayscale(80%) opacity(0.9) |
| planned | grayscale(90%) opacity(0.5) |
| selected | scale(1.25) + drop-shadow |
| hover | scale(1.5) + drop-shadow |

## Interaction Model

1. **Marker Click** → `selectedLocation = project`, `isOpened = true` → ProjectDetails side panel opens
2. **Side Panel Close** → `selectedLocation = undefined`, `isOpened = false`
3. **Map Click** (Ctrl+Alt, zoom >= 9) → prompt for name → `projectService.add()` (TBD)
4. **Zoom End** → debounce 100ms → update `currentZoom` → tooltips toggle at zoom > 7

## Loading States

```
1. Map skeleton (spinner + "Loading map...")
2. Tiles load immediately (mapReady = true)
3. Pins loading indicator (if mapInitialized && !pinsReady)
4. Pins ready (locations loaded, markers rendered)
```

## Mobile Behavior

- Zoom controls hidden (`display: none` on `.leaflet-control-zoom`)
- Touch zoom enabled
- Scroll wheel zoom enabled (but less relevant on touch)
- Overscroll behavior: none (set via useWebFrame when in iframe)
