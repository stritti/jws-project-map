## Why

The project data pipeline is the backbone of the application. It handles fetching, transforming, caching, and serving project data from NocoDB to the UI. The two-tier loading strategy (fast map data → full project details), multi-layer caching, locale-aware field resolution, and stale-data background refresh are complex behaviors that need formal documentation to prevent regressions and guide future changes.

## What Changes

- Document the complete data flow: NocoDB API → NocoDBService → ProjectRepository → ProjectService → ProjectStore → Components
- Specify the two-tier loading strategy: `getMapData()` (minimal fields) vs `getAll()` (full fields)
- Document the three-layer caching system: service-level (5min), store-level (30min), stale threshold (1h)
- Specify the locale-aware field resolution: `Name ({locale})`, `Notes ({locale})` with fallback to English
- Document the raw-to-clean data transformation: `RawProjectRecord` → `Project` interface
- Specify the background refresh mechanism: `refreshIfStale()` triggered on app mount
- Document the store persistence strategy: which fields persist, which are transient
- Specify the filter pipeline: filter store → project store doFilter → reactive re-application

## Capabilities

### New Capabilities
- `project-data`: Data fetching, transformation, caching, persistence, and filtering pipeline for project data from NocoDB

## Impact

- **Components affected**: All views and components that consume project data
- **Services affected**: `NocoDBService`, `projectRepository`, `projectService`, `projectStore`, `filterStore`
- **No breaking changes**: Documentation-only change
