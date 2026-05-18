## Requirements

### Route Configuration

- SHALL use Vue Router 5 with HTML5 history mode (`createWebHistory`)
- SHALL define routes: `/` (HomeView), `/project/` (ProjectListView), `/project/:projectId` (ProjectDetailView)
- SHALL redirect `/about` to `/`
- SHALL lazy-load ProjectListView and ProjectDetailView via dynamic imports
- SHALL assign chunk names: "project-list" and "project-detail"
- SHALL set the base document title to "Jörg Wolff Foundation — Projects in West Africa"

### MainMenu Navigation

- SHALL be fixed to the bottom of the viewport with frosted glass styling
- SHALL display navigation items for Map (`/`) and List (`/project/`)
- SHALL use filled icons for active state, outline icons for inactive state
- SHALL use exact match for the home route (`route.path === "/"`)
- SHALL use prefix match for the project route (`route.path.startsWith("/project")`)
- SHALL set `aria-current="page"` on the active navigation item
- SHALL display an About button that opens the AboutModal
- SHALL display a language switcher with DE, EN, FR flag buttons
- SHALL hide SiteFooter and FloatingMeta when running in an iframe

### Iframe-Aware Navigation

- SHALL detect iframe mode via URL params (`?embed=1`, `?iframe=1`) or `window.self !== window.top`
- SHALL apply the `is-iframe` CSS class to `<html>` when in iframe mode
- SHALL set `overscrollBehavior: none` on document when in iframe mode
- SHALL navigate in-place via `router.push()` when NOT in an iframe
- SHALL open project details in a new tab via `window.open(url, '_blank')` when in an iframe
- SHALL send a `navigateRequest` postMessage to the parent when navigating in iframe mode
- SHALL send a `ready` postMessage to the parent on mount
- SHALL report height changes to the parent via `resize` postMessage using ResizeObserver

### Iframe Communication

- SHALL listen for `navigate` messages from the parent and route accordingly
- SHALL handle all message types: `ready`, `resize`, `navigate`, `navigateRequest`
- SHALL gracefully handle postMessage failures (cross-origin scenarios)
- SHALL clean up message event listeners on component unmount

### Dynamic Page Titles

- SHALL update `document.title` on every route change via `router.afterEach`
- SHALL display the project name in the title for detail views
- SHALL display localized view names (via `t()`) for map and list views
- SHALL set the title on initial load (not just on route changes)

### Back Button

- SHALL navigate back in browser history when clicked
- SHALL be hidden when running in an iframe

### Share Button

- SHALL use the Web Share API when available
- SHALL fall back to copying the URL to clipboard when Web Share API is unavailable
- SHALL share the project name as title and text, and the current route path as URL

### Navigate Button

- SHALL open Google Maps with the project's latitude and longitude
- SHALL open in a new tab

### Safe Area Support

- SHALL respect `env(safe-area-inset-*)` CSS environment variables for notched devices
- SHALL apply safe area insets to MainMenu padding, leaflet controls, and search overlay
