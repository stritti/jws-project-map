## Why

The application implements SEO optimization through dynamic page titles and geographic meta tags (geo.region, geo.placename, geo.position, ICBM) that help search engines index project locations in West Africa. The SEO system is tied to the project detail view and updates dynamically as users navigate between projects. This capability needs documentation to ensure SEO behavior is maintained.

## What Changes

- Document the geo meta tag system: geo.region, geo.placename, geo.position, ICBM
- Specify the useGeoTags composable: reactive meta tag management, cleanup on unmount
- Document the dynamic page title strategy (already partially covered in navigation-routing)
- Specify the SEO meta tag lifecycle: creation, update, cleanup

## Capabilities

### New Capabilities
- `seo-meta`: Geographic meta tags, dynamic page titles, and SEO optimization for project locations

## Impact

- **Composables affected**: `useGeoTags`
- **Views affected**: `ProjectDetailView.vue`
- **No breaking changes**: Documentation-only change
