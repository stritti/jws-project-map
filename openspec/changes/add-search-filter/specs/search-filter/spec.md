## Requirements

### Fuzzy Search

- SHALL use Fuse.js for fuzzy text search across project data
- SHALL weight search keys: name (×3), country.Name (×2), category.Name (×2), notes (×1), state (×1)
- SHALL use a threshold of 0.35 for fuzzy matching
- SHALL require a minimum of 2 characters before activating search
- SHALL limit results to a configurable maximum (default varies by view)
- SHALL return all projects when the search query is empty or less than 2 characters

### Multi-Dimensional Filtering

- SHALL support filtering by state, category, and country dimensions
- SHALL apply OR logic within each filter dimension (multiple values match any)
- SHALL apply AND logic across filter dimensions (all dimensions must match)
- SHALL treat empty filter arrays as "match all" (no filtering applied)
- SHALL automatically re-apply filters when any filter value changes
- SHALL automatically re-apply filters when project data loads or updates

### Search Bar

- SHALL display a text input for search queries
- SHALL display a filter button that toggles the FilterPanel
- SHALL display an active filter count badge when filters are applied
- SHALL support view-mode switching (map ↔ list) with navigation
- SHALL bind search query via v-model to the Fuse.js composable

### Search Modal

- SHALL open when the user presses Ctrl+K or Cmd+K
- SHALL NOT open when the user is typing in an input or textarea
- SHALL auto-focus the search input when the modal opens
- SHALL display search results with project thumbnails, state badges, and country
- SHALL navigate to the project detail when a result is clicked
- SHALL reset the search query and state filter when the modal closes
- SHALL restore focus to the trigger element when the modal closes
- SHALL search across all projects (not just filtered list)

### Filter Panel

- SHALL display checkbox groups for state, category, and country filters
- SHALL display a map-type toggle (satellite/OSM) when on the map view
- SHALL close when the user clicks the backdrop (mobile) or the close button
- SHALL use localized display names for categories and countries

### Active Filter Pills

- SHALL display active filters as removable pills below the search bar
- SHALL show the filter group type and value name for each pill
- SHALL allow removing individual filters by clicking the × button
- SHALL provide a "Clear All" button to reset all filters and search query

### View-Specific Behavior

- HomeView (Map):
  - SHALL float the search bar at the bottom on mobile, top on desktop
  - SHALL show search results as an inline dropdown (max 10 visible)
  - SHALL limit Fuse.js results to 50
  - SHALL include a map-type toggle in the filter panel

- ProjectListView (List):
  - SHALL display the search bar as a sticky toolbar
  - SHALL show results as a card grid
  - SHALL limit Fuse.js results to 200
  - SHALL default to all three states selected in the state filter

### Accessibility

- SHALL announce filter result counts to screen readers via aria-live regions
- SHALL use role="listbox" and role="option" for search result lists
- SHALL support keyboard navigation of search results (Enter, Space)
- SHALL provide visible focus indicators for all interactive elements
