## Requirements

### Geo Meta Tags

- SHALL manage four geo meta tags: `geo.region`, `geo.placename`, `geo.position`, `ICBM`
- SHALL set `geo.region` to the project's country name (`project.country.fields.Name`)
- SHALL set `geo.placename` to the project name
- SHALL set `geo.position` to `"{latitude};{longitude}"` (semicolon-separated)
- SHALL set `ICBM` to `"{latitude}, {longitude}"` (comma-separated)

### Meta Tag Lifecycle

- SHALL create `<meta>` elements in `<head>` when a project is loaded
- SHALL update meta tag content when the project changes
- SHALL remove all geo meta tags when the project becomes undefined
- SHALL clean up (remove) all geo meta tags when the component is unmounted
- SHALL use the `useGeoTags` composable for reactive meta tag management

### Dynamic Page Titles

- SHALL update `document.title` on every route change
- SHALL include the project name in the title for project detail views
- SHALL use localized view names for map and list views
- SHALL append "— JWS Project Map" as the consistent suffix

### Integration

- SHALL call `useGeoTags(project)` in ProjectDetailView with a reactive project ref
- SHALL NOT render geo meta tags on views without a specific project context
- SHALL handle missing country data gracefully (empty string for geo.region)
