# src/services/

## Responsibility
Shared service layer for external API integration. Provides generic NocoDB v3 CRUD operations and domain-specific services for categories and countries.

## Design
Three services:
- **nocodb.service.ts** — Generic `NocoDBService` class. Handles `list` (with pagination, sorting, field filtering, viewId), `read`, `create`, `update`, `delete`, `count`. `list()` auto-converts offset/page (offset must be multiple of limit).
- **category.service.ts** — Extends NocoDBService for the Categories table. Fetches locale-aware category list.
- **country.service.ts** — Extends NocoDBService for the Countries table. Fetches locale-aware country list.

All use the shared Axios `httpClient` instance.

## Flow
```
Store → Service (this dir) → httpClient (api/) → NocoDB REST API
```

## Integration
- Depends on: `src/services/api/http.client.ts` (Axios instance)
- Consumed by: `project.store.ts` (via project.repository.ts), `category.store.ts`, `country.store.ts`
