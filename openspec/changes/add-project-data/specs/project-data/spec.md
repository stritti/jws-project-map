## Requirements

### Data Fetching

- SHALL fetch project data from NocoDB v3 API at `/api/v3/data/{baseId}/{tableId}/records`
- SHALL support two fetch modes: minimal (map data) and full (all fields)
- SHALL request only necessary fields in minimal mode to reduce payload size
- SHALL handle both `data.list` and `data.records` response formats from NocoDB
- SHALL return empty arrays on fetch errors rather than throwing

### Two-Tier Loading

- SHALL load map data (name, coordinates, state, category, country) first for fast initial render
- SHALL load full project data (teaser image, notes, link, since, gallery) in the background
- SHALL use map data as temporary project list when full data is not yet available
- SHALL allow parallel execution of map data and full data loading via separate loading flags

### Caching

- SHALL cache service-level data for 5 minutes
- SHALL cache store-level data for 30 minutes
- SHALL consider data stale after 1 hour and trigger background refresh
- SHALL rate-limit refresh attempts to maximum once per 60 seconds
- SHALL NOT persist transient state (loading flags, filteredList) to localStorage
- SHALL persist projects, mapProjects, initialized, lastFetched, and lastRefreshAttempted to localStorage

### Locale-Aware Fields

- SHALL resolve multilingual fields using the current i18n locale: `Name ({locale})`, `Notes ({locale})`
- SHALL fall back to English field names (`Name`, `Notes`) when locale-specific fields are unavailable
- SHALL refetch project data when the user changes the application locale
- SHALL cache processed data per locale to avoid re-processing on repeated access

### Data Transformation

- SHALL transform raw NocoDB records into clean Project interface objects
- SHALL skip records with missing IDs
- SHALL skip records with invalid coordinates (NaN, null, undefined)
- SHALL default project state to "finished" when not specified
- SHALL default project name to "Unbenannt" when not specified
- SHALL clean malformed markdown links in notes fields
- SHALL convert Since field strings to Date objects

### Filtering

- SHALL support filtering by state, category, and country dimensions
- SHALL apply AND logic across filter dimensions
- SHALL apply OR logic within category and country filters (multiple selection)
- SHALL automatically re-apply filters when filter values change
- SHALL automatically re-apply filters when project data loads or updates
- SHALL produce an empty filteredList when active filters match no projects

### Store Initialization

- SHALL preload map data in main.ts before app mount (non-blocking)
- SHALL load categories and countries in main.ts before app mount (non-blocking)
- SHALL check for stale data and trigger background refresh after app mount
- SHALL load full project data in background when HomeView mounts

### Error Handling

- SHALL log errors to console but not crash the application
- SHALL fall back to cached data when fetch fails
- SHALL fall back to map data when full data fetch fails and no projects are loaded
- SHALL handle unexpected NocoDB response structures gracefully
