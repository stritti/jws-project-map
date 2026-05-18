## SEO Meta Tag System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SEO Meta Tags                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  useGeoTags Composable (composables/useGeoTags.ts)            │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Input: Ref<Project | undefined>                              │   │
│  │                                                               │   │
│  │  Meta Tags Managed:                                           │   │
│  │  ┌──────────────────┬──────────────────────────────────────┐  │   │
│  │  │ Tag Name         │ Value                                │  │   │
│  │  ├──────────────────┼──────────────────────────────────────┤  │   │
│  │  │ geo.region       │ project.country.fields.Name          │  │   │
│  │  │ geo.placename    │ project.name                         │  │   │
│  │  │ geo.position     │ "{latitude};{longitude}"             │  │   │
│  │  │ ICBM             │ "{latitude}, {longitude}"            │  │   │
│  │  └──────────────────┴──────────────────────────────────────┘  │   │
│  │                                                               │   │
│  │  Lifecycle:                                                   │   │
│  │    1. watch(project) → updateMetaTags(newProject)             │   │
│  │    2. If project exists → create/update <meta> elements       │   │
│  │    3. If project is undefined → remove all geo meta tags      │   │
│  │    4. onUnmounted → removeMetaTags() (cleanup)                │   │
│  │                                                               │   │
│  │  Meta Element Management:                                     │   │
│  │    - Creates <meta> elements if they don't exist              │   │
│  │    - Updates content attribute if element exists              │   │
│  │    - Removes elements from <head> on cleanup                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dynamic Page Titles (usePageTitle — see navigation-routing)  │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Home (/)         → "{nav.map} — JWS Project Map"            │   │
│  │  List (/project/) → "{nav.list} — JWS Project Map"           │   │
│  │  Detail (/p/:id)  → "{project.name} — JWS Project Map"       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Usage in ProjectDetailView                                   │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  const project = computed(() =>                               │   │
│  │    projectStore.projects.find(p => p.id === id)               │   │
│  │  )                                                            │   │
│  │  useGeoTags(project)  ← reactive, auto-updates                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Geo Meta Tag Standards

```
┌──────────────────────────────────────────────────────────────┐
│  Standard                                                     │
├──────────────────────────────────────────────────────────────┤
│  geo.region    → ISO 3166-2 region code or country name       │
│                  Used by search engines for geographic indexing│
│                                                               │
│  geo.placename → Human-readable location name                 │
│                  Used by geographic search engines             │
│                                                               │
│  geo.position  → "lat;lng" format (semicolon-separated)       │
│                  Used by geographic search engines             │
│                                                               │
│  ICBM          → "lat, lng" format (comma-separated)          │
│                  Original geo tagging standard (ICBM =         │
│                  Internet Content-Based Metadata)              │
└──────────────────────────────────────────────────────────────┘
```
