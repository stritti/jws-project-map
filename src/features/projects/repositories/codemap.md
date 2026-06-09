# src/features/projects/repositories/

## Responsibility
Data access layer for the Projects NocoDB table. Encapsulates all NocoDB v3 API interactions: CRUD operations, pagination, field filtering, and view-specific queries.

## Design
Repository pattern (`project.repository.ts`). Extends `NocoDBService` with hardcoded table ID (`mdctuswlmsfvi8i`) and view ID (`vwlnl4t095iifqc9`).

Key methods:
- `fetchAll(params?)` — paginated list with field selection, sorting, view filtering
- `fetchById(id)` — single record read
- `fetchCount()` — record count with optional where clause
- `fetchMapData()` — optimized query returning only coordinate/name/category fields

Pagination uses NocoDB's offset/limit model (offset must be a multiple of limit). Field filtering via `fields` query parameter reduces payload size.

## Flow
1. Store calls a fetch method on the repository instance
2. Repository builds NocoDB v3 REST URL: `/api/v3/data/{baseId}/{tableId}/records`
3. Applies query params: `fields`, `sort`, `limit`, `offset`, `viewId`
4. Axios HTTP client executes GET with `xc-token` header
5. Returns `RawProjectRecord[]` (v2-style wrapper: `{ id, fields: { ... } }`)
6. Response flows back to store → service layer for transformation

## Integration
- Extends: `NocoDBService` (generic CRUD in `src/services/nocodb.service.ts`)
- Uses: `httpClient` (Axios instance from `src/services/api/http.client.ts`)
- Consumed by: `project.store.ts`
