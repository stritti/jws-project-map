## Why

The search and filtering system is a core user-facing feature that combines fuzzy text search (Fuse.js) with multi-dimensional faceted filtering (state, category, country). It operates across two views (map and list) with different UI patterns, supports a global search modal (Ctrl+K), and maintains filter state reactively. This capability needs documentation to ensure consistent behavior across views and prevent regressions.

## What Changes

- Document the Fuse.js fuzzy search configuration and key weighting strategy
- Specify the multi-dimensional filter model (state, category, country) with AND/OR logic
- Document the filter state management: FilterStore as shared source of truth
- Specify the search modal behavior: Ctrl+K shortcut, focus management, result navigation
- Document the active filter pills display and removal behavior
- Specify the view-specific search/filter UI patterns (map overlay vs list sticky toolbar)
- Document the reactive filter re-application pipeline

## Capabilities

### New Capabilities
- `search-filter`: Fuzzy search, multi-dimensional filtering, search modal, and filter state management

## Impact

- **Components affected**: `SearchBar.vue`, `SearchModal.vue`, `FilterPanel.vue`, `HomeView.vue`, `ProjectListView.vue`
- **Stores affected**: `filterStore`, `searchStore`, `projectStore`
- **Composables affected**: `useProjectSearch`
- **No breaking changes**: Documentation-only change
