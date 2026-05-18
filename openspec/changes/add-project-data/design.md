## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Flow Pipeline                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  NocoDB API (v3)                                                     │
│  /api/v3/data/{baseId}/{tableId}/records                             │
│       │                                                              │
│       ▼                                                              │
│  ┌──────────────────┐                                                │
│  │  NocoDBService   │  list(), read(), count(), create(), update()   │
│  │  (generic CRUD)  │  offset→page conversion, response normalization│
│  └────────┬─────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                                │
│  │ ProjectRepository│  fetchMinimal(), fetchFull()                   │
│  │ (table-specific) │  hardcoded tableId, viewId, field selection    │
│  └────────┬─────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                                │
│  │  ProjectService  │  getMapData(), getAll()                        │
│  │ (domain logic)   │  caching (5min), processProjectData(), locale  │
│  └────────┬─────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                                │
│  │  ProjectStore    │  preloadMapData(), load(), doFilter()          │
│  │ (Pinia + persist)│  cache validity (30min), stale refresh (1h)   │
│  └────────┬─────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                                │
│  │    Components    │  HomeView, ProjectListView, ProjectDetailView  │
│  └──────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Two-Tier Loading

```
┌──────────────────────────────────────────────────────────────┐
│  Tier 1: Map Data (preloadMapData → getMapData)              │
│  ─────────────────────────────────────────────────────────── │
│  Fields: Name, Latitude, Longitude, State, Category, Country │
│  Purpose: Fast initial render of map pins                    │
│  Called: In main.ts, before app mount                        │
│  Cache: 5 min (service), 30 min (store)                      │
├──────────────────────────────────────────────────────────────┤
│  Tier 2: Full Data (load → getAll)                           │
│  ─────────────────────────────────────────────────────────── │
│  Fields: All Tier 1 + TeaserImage, Notes, Link, Since,       │
│          Gallery                                             │
│  Purpose: Complete project details for list/detail views     │
│  Called: In HomeView (background), ProjectListView,          │
│          ProjectDetailView                                   │
│  Cache: 5 min (service), 30 min (store)                      │
└──────────────────────────────────────────────────────────────┘
```

## Caching Layers

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Service Cache (projectService)                     │
│  ─────────────────────────────────────────────────────────── │
│  Type: In-memory Map with timestamp                          │
│  Validity: 5 minutes (CACHE_VALIDITY_MS)                     │
│  Keys: { timestamp, data[], mapData[] }                      │
│  Scope: processProjectData cache (Map<string, Project[]>)    │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: Store Cache (projectStore)                         │
│  ─────────────────────────────────────────────────────────── │
│  Type: Pinia state + localStorage persistence                │
│  Validity: 30 minutes (CACHE_VALIDITY_MS)                    │
│  Persisted: projects, mapProjects, initialized, lastFetched, │
│             lastRefreshAttempted                             │
│  Transient: loading, loadingMapData, filteredList            │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: Stale Threshold                                    │
│  ─────────────────────────────────────────────────────────── │
│  Threshold: 1 hour (STALE_DATA_MS)                           │
│  Action: Background refresh via refreshIfStale()             │
│  Trigger: On app mount (requestAnimationFrame in main.ts)    │
│  Rate limit: Max once per 60 seconds                         │
└──────────────────────────────────────────────────────────────┘
```

## Locale-Aware Field Resolution

```
NocoDB stores multilingual fields as:
  "Name (de)", "Name (en)", "Name (fr)"
  "Notes (de)", "Notes (en)", "Notes (fr)"

Resolution:
  1. currentLocale() → i18n.global.locale.value (default: "en")
  2. Field key: `Name (${locale})` or fallback to `Name`
  3. Field key: `Notes (${locale})` or fallback to `Notes`
  4. Process cache keyed by locale + forMapOnly + record count

Note: When locale changes (MainMenu.switchLocale), projectStore.load(false)
is called to refetch data with the new locale's field names.
```

## Raw Record Transformation

```
RawProjectRecord (from NocoDB):
{
  id: number | string,
  fields: {
    "Name (en)": string,
    "Latitude": number,
    "Longitude": number,
    "State": "finished" | "under construction" | "planned",
    "Category": LinkedRecord[],
    "Country": LinkedRecord[],
    "TeaserImage": Attachment[],
    "Notes (en)": string,
    "Link": string,
    "Since": string,
    "Gallery": Attachment[]
  }
}

↓ processProjectData()

Project (clean interface):
{
  id: number,
  name: string,
  latitude: number,
  longitude: number,
  state: string,
  category: LinkedRecord[] | undefined,
  country: LinkedRecord | undefined,
  teaserImg: Attachment[] | undefined,
  notes: string | undefined,
  link: string | undefined,
  since: Date | null,
  gallery: Attachment[] | undefined
}

Validation:
  - Skip if no id
  - Skip if invalid coordinates (NaN, null, undefined)
  - Default state: "finished"
  - Default name: "Unbenannt"
  - Notes cleanup: fix malformed markdown links
```

## Filter Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  FilterStore (filter.store.ts)                               │
│  ─────────────────────────────────────────────────────────── │
│  State: stateFilter[], categoryFilter[], countryFilter[]     │
│  Auto-reapply: watch on all three filters (deep: true)       │
│  Auto-reapply: watch on projectStore.projects (immediate)    │
├──────────────────────────────────────────────────────────────┤
│  ProjectStore.doFilter()                                     │
│  ─────────────────────────────────────────────────────────── │
│  Input: stateFilter[], categoryFilter[], countryFilter[]     │
│  Logic: AND across dimensions, OR within category/country    │
│  Output: filteredList[]                                      │
│  Category match: project.category?.some(cat => ids.includes) │
│  Country match: project.country && ids.includes(country.id)  │
└──────────────────────────────────────────────────────────────┘
```

## Store Initialization Sequence

```
main.ts:
  1. Create Pinia + persistedstate plugin
  2. Create app, use Pinia, Router, i18n
  3. Get store instances
  4. projectStore.preloadMapData()  ← fires immediately, non-blocking
  5. categoryStore.load()           ← fires immediately, non-blocking
  6. countryStore.load()            ← fires immediately, non-blocking
  7. app.mount("#app")
  8. requestAnimationFrame:
     - Add .mounted class to #app
     - Fade out #app-shell
     - projectStore.refreshIfStale()  ← background refresh check

HomeView.vue:
  9. projectStore.load(false)       ← fires in background, non-blocking
```
