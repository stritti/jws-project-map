# src/services/

## Responsibility
Shared service layer for external API integration. Provides generic NocoDB v3 CRUD operations and domain-specific services for categories and countries.

## Design
Four services:
- **nocodb.service.ts** — Generic `NocoDBService` class. Handles `list` (with pagination, sorting, field filtering, viewId), `read`, `create`, `update`, `delete`, `count`. `list()` auto-converts offset/page (offset must be multiple of limit).
- **lookup.service.ts** — Shared `fetchLocalizedLookup()` for the small lookup tables (categories, countries): sorted list from a view with `name_<locale>` mapping.
- **category.service.ts** — Categories table via `fetchLocalizedLookup`, adds `color`.
- **country.service.ts** — Countries table via `fetchLocalizedLookup`, adds `code`.

All use the shared native-fetch `httpClient` instance.

## Flow
```
Store → Service (this dir) → httpClient (api/) → NocoDB REST API
```

## Integration
- Depends on: `src/services/api/http.client.ts` (native fetch wrapper)
- Consumed by: `project.store.ts` (via project.repository.ts), `category.store.ts`, `country.store.ts`
