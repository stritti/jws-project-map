# src/features/projects/services/

## Responsibility
Domain service that transforms raw NocoDB records into the clean `Project` interface. Handles locale-aware field mapping, image URL construction, and data normalization.

## Design
Stateless service module (`project.service.ts`) with pure transformation functions. Uses a Map-based memoization cache (`processDataCache`) keyed by `locale-mapType-listLength` to avoid re-processing the same data.

Key functions:
- `processProjects(list, locale?, forMapOnly?)` — main entry point; filters, maps, and enriches raw records
- `processMapData(list, locale?)` — lightweight path for map pins (fewer fields)
- `buildImageUrl(filename)` — constructs full NocoDB attachment URLs
- `buildTeaser(notes, locale?)` — extracts first paragraph from markdown notes

Locale handling: reads field suffixes (`Name_de`, `Name_fr`, `Name_en`) based on current i18n locale.

## Flow
1. Repository returns `RawProjectRecord[]` from NocoDB API
2. Service maps each record, normalizing field names and types
3. `teaserImg` is resolved from attachments array (first image with thumbnail)
4. Gallery images are filtered/sorted from attachments
5. Locale-specific fields are selected based on active locale
6. Returns `Project[]` to the caller (store or cache)

## Integration
- Called by: `project.store.ts` (store commits to state)
- Calls: NocoDB attachment URL builder (internal helper)
- Output consumed by: all view/component layers via the store
