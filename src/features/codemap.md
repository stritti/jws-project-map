# src/features/

## Responsibility
Feature module root. Intended for domain-specific feature slices following a feature-based architecture. Currently contains only one feature — `projects/`.

## Design
Feature-sliced architecture: each domain gets its own directory with internal layers (data access, business logic, state). Encourages colocation of related code and limits cross-feature coupling.

## Integration
- Currently only `projects/` is implemented
- Future features would follow the same layered pattern (repositories/ → services/ → stores/)
- Shared infrastructure lives in sibling dirs: `src/services/`, `src/stores/`, `src/composables/`
