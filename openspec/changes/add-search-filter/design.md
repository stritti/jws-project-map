## Search Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Search & Filter System                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  useProjectSearch(projects, { limit })                        │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Input: Ref<Project[]> (filteredList from projectStore)       │   │
│  │  Engine: Fuse.js (threshold: 0.35, minMatchCharLength: 2)    │   │
│  │  Keys: name (×3), country.Name (×2), category.Name (×2),     │   │
│  │        notes (×1), state (×1)                                │   │
│  │  Output: computed<Project[]> results                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  FilterStore (filter.store.ts)                                │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  State: stateFilter[], categoryFilter[], countryFilter[]     │   │
│  │  Auto-reapply: watch(filters) → projectStore.doFilter()      │   │
│  │  Auto-reapply: watch(projects) → projectStore.doFilter()     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  SearchStore (search.store.ts)                                │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  State: isSearchVisible                                       │   │
│  │  Actions: openSearch(), closeSearch(), toggleSearch()        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  UI Components                                                │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  SearchBar: Text input + filter button + view toggle         │   │
│  │  SearchModal: Full-screen modal (Ctrl+K) with results list   │   │
│  │  FilterPanel: Slide-out panel with checkbox groups           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Fuse.js Configuration

```javascript
{
  threshold: 0.35,           // Fuzzy match sensitivity (0=exact, 1=match anything)
  minMatchCharLength: 2,     // Minimum characters before search activates
  includeScore: true,        // Include relevance score in results
  keys: [
    { name: "name", weight: 3 },           // Highest priority
    { name: "country.Name", weight: 2 },   // Medium priority
    { name: "category.Name", weight: 2 },  // Medium priority
    { name: "notes", weight: 1 },          // Low priority
    { name: "state", weight: 1 },          // Low priority
  ]
}
```

## Filter Logic

```
┌──────────────────────────────────────────────────────────────┐
│  Filter Combination Logic                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  State Filter:    OR within dimension                         │
│                   (state === "finished" OR state === "planned")│
│                                                               │
│  Category Filter: OR within dimension                         │
│                   (project.category?.some(cat => ids.includes))│
│                                                               │
│  Country Filter:  OR within dimension                         │
│                   (project.country && ids.includes(country.id))│
│                                                               │
│  Across Dimensions: AND                                       │
│                   (state match) AND (category match) AND       │
│                   (country match)                              │
│                                                               │
│  Empty Filter Array:  matches all (no filtering)              │
│                                                               │
│  Search Query:    Applied AFTER store filters                  │
│                   Fuse.js on filteredList                      │
│                   Only activates when query.length >= 2        │
└──────────────────────────────────────────────────────────────┘
```

## View-Specific Patterns

```
┌──────────────────────────────────────────────────────────────┐
│  HomeView (Map)                                               │
│  ─────────────────────────────────────────────────────────── │
│  SearchBar: Floating overlay (bottom on mobile, top on       │
│             desktop)                                          │
│  FilterPanel: Backdrop overlay with map-type toggle           │
│  Results: Inline dropdown below search bar (max 10 items)     │
│  Search on filteredList (store-filtered projects)             │
│  Limit: 50 results                                            │
├──────────────────────────────────────────────────────────────┤
│  ProjectListView (List)                                       │
│  ─────────────────────────────────────────────────────────── │
│  SearchBar: Sticky toolbar at top of list                     │
│  FilterPanel: Backdrop overlay                                │
│  Results: Card grid (ProjectListItem components)              │
│  Search on filteredList (store-filtered projects)             │
│  Limit: 200 results                                           │
│  Default state filter: all three states selected              │
├──────────────────────────────────────────────────────────────┤
│  SearchModal (Global, Ctrl+K)                                 │
│  ─────────────────────────────────────────────────────────── │
│  Trigger: Ctrl+K / Cmd+K (when not typing in input)          │
│  Content: Full modal with SearchBar + results list            │
│  Results: List group with thumbnails, state badges, country   │
│  Navigation: Click result → navigateToProject()               │
│  Focus: Auto-focus search input on modal open                 │
│  Reset: Clear query and state filter on modal close           │
│  Search on: ALL projects (projectStore.projects)              │
│  Limit: default (20)                                          │
└──────────────────────────────────────────────────────────────┘
```

## Active Filter Pills

```
Active filters are displayed as removable pills in both views:

┌──────────────────────────────────────────────────────────────┐
│  [Status: Finished ×]  [Category: School ×]  [Clear All]     │
└──────────────────────────────────────────────────────────────┘

Each pill has:
  - id: unique identifier (e.g., "state-finished", "cat-3")
  - type: filter group label (localized)
  - name: display name of the filter value
  - value: the actual filter value
  - category: "state" | "category" | "country"

Clicking × removes the individual filter.
"Clear All" resets all filters and search query.
```

## Keyboard Shortcuts

| Shortcut | Action | Condition |
|----------|--------|-----------|
| Ctrl+K / Cmd+K | Open search modal | Not typing in input/textarea |
| Escape | Close search modal | Modal is open |
| Enter | Navigate to selected project | Search result focused |
| Space | Navigate to selected project | Search result focused (prevent scroll) |
