# src/stores/

## Responsibility
Global Pinia stores for shared state that is not specific to a single feature module. Includes category, country, filter, search, and loading state.

## Design
Five Pinia stores, all using Composition API (`defineStore` + `setup()` function):

- **category.store.ts** — Loads categories from NocoDB, provides locale-aware category names. `persist: false`.
- **country.store.ts** — Loads countries from NocoDB, provides locale-aware country names. `persist: false`.
- **filter.store.ts** — Reactive filter state (selected statuses, categories, countries, search query). No persistence.
- **search.store.ts** — Search query state and results for the global SearchModal.
- **loading.store.ts** — Simple loading flag used across views for spinner/loading state.

The category and country stores are preloaded eagerly in `main.ts` (alongside the project store's `preloadMapData()`).

## Flow
1. `main.ts` calls `useCategoryStore().load()` and `useCountryStore().load()` before app mount
2. Stores fetch from respective NocoDB services
3. Store data is consumed by components via `useXxxStore()` composables
4. Category/country data is used for: filter options, display badges, locale-aware labels

## Integration
- Depends on: `category.service.ts`, `country.service.ts`, `nocodb.service.ts`
- Consumed by: FilterPanel, SearchBar, CategoryBadge, CountryLabel, ProjectListItem, ProjectDetails
- Category and country stores are consumed by the project service for locale-aware field mapping
