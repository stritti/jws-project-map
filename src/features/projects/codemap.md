# src/features/projects/

## Responsibility
The sole feature module in the application. Encapsulates the complete project domain: data access, business logic, and state management. Follows a clean layered architecture.

## Design
Layered architecture with three strict layers:
- **repositories/** — NocoDB data access (raw API communication)
- **services/** — domain transformation (raw → clean Project model)
- **stores/** — Pinia state management (reactive store consumed by UI)

Types are centralized in `src/interfaces/` (not local to the feature).

## Flow
```
User Action → Component → Store → Repository → NocoDB API
                                           ↓
                              Service (transform records)
                                           ↓
                              Store (commits to state)
                                           ↓
                              Component re-renders reactively
```

## Integration
- Consumed by: views (HomeView, ProjectListView, ProjectDetailView) and shared components (SearchModal, LocationMap)
- Depends on: `src/services/` (NocoDBService base class, httpClient), `src/interfaces/` (Project type)
