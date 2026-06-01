# src/interfaces/

## Responsibility
TypeScript type definitions shared across the application. Defines the shape of domain entities and API responses.

## Design
Five interface files:

- **Project.ts** — `Project` interface: full domain model with all fields (id, name, coordinates, category, country, state, description, notes, link, gallery images, teaser image, etc.)
- **Category.ts** — `Category` interface with locale-aware name fields
- **Country.ts** — `Country` interface with locale-aware name fields and flag code
- **Attachment.ts** — `Attachment` interface for NocoDB file attachments (url, thumbnail, name, mimetype)
- **LinkedRecord.ts** — `LinkedRecord` generic interface for NocoDB linked record references

Raw API response shape (`RawProjectRecord`) is defined in the repository layer, not here.

## Integration
- Imported by: services, stores, components, and composables across the entire app
- The `Project` interface is the single source of truth for project data shape after service-layer transformation
