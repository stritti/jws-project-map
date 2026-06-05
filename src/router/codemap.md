# src/router/

## Responsibility
Application routing configuration. Maps URL paths to view components.

## Design
Vue Router 5 (not v4 — important for API compatibility). Routes defined in `index.ts`:

| Path | Component | Name |
|------|-----------|------|
| `/` | HomeView | `home` |
| `/project/:projectId` | ProjectDetailView | `project-detail` |
| `/list` | ProjectListView | (redirects to `/`) |
| `/about` | AboutView | `about` |

All routes use lazy loading via dynamic `import()`. Scroll behavior: `scrollBehavior` resets to top on navigation.

## Flow
1. User navigates (link, button, address bar, or programmatic `router.push()`)
2. Router matches URL to route definition
3. Lazy-loads the view component
4. Renders in `<router-view />` in App.vue
5. `usePageTitle` composable updates `document.title` on `afterEach` navigation guard

## Integration
- Used by: App.vue (`<router-view>`), MainMenu (`router-link`), all navigation actions
- Depends on: `vue-router` 5.x, all view components (lazy-loaded)
