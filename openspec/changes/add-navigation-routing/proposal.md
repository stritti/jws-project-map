## Why

The navigation system provides the primary user journey through the application: map view → project list → project detail. It uses Vue Router 5 with a bottom-fixed mobile navigation bar, iframe-aware navigation behavior (in-place vs. new tab), and dynamic page titles. This capability needs documentation to ensure consistent navigation behavior across embedding contexts.

## What Changes

- Document the Vue Router 5 configuration with route definitions and lazy loading
- Specify the MainMenu component: bottom-fixed navigation, active state, language switcher integration
- Document the iframe-aware navigation model: in-place routing vs. new tab opening
- Specify the dynamic page title strategy via usePageTitle composable
- Document the back button behavior and navigation actions (share, navigate)

## Capabilities

### New Capabilities
- `navigation-routing`: Vue Router configuration, MainMenu navigation, iframe-aware navigation, and dynamic page titles

## Impact

- **Components affected**: `MainMenu.vue`, `BackButton.vue`, `ShareButton.vue`, `NavigateButton.vue`, `App.vue`
- **Router affected**: `router/index.ts`
- **Composables affected**: `useWebFrame`, `useAccessibility` (usePageTitle)
- **No breaking changes**: Documentation-only change
