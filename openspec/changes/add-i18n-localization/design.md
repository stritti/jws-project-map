## i18n Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    i18n Localization System                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  vue-i18n Configuration (plugins/i18n.ts)                     │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Locales: de, en, fr                                          │   │
│  │  Messages: src/locales/{de,en,fr}.json                        │   │
│  │  Fallback: en                                                 │   │
│  │  Legacy: false (Composition API mode)                         │   │
│  │  Type: createI18n<[typeof de], Locale>                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Locale Resolution Order                                      │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  1. localStorage.getItem("jws-locale")                        │   │
│  │  2. navigator.language.split("-")[0] (browser default)        │   │
│  │  3. Fallback: "en"                                            │   │
│  │                                                               │   │
│  │  Whitelist validation: only "de", "en", "fr" accepted         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Locale Change Flow                                           │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  MainMenu.switchLocale(locale)                                │   │
│  │    → setLocale(locale)                                        │   │
│  │      → i18n.global.locale.value = locale                      │   │
│  │      → localStorage.setItem("jws-locale", locale)             │   │
│  │    → useProjectStore().load(false)  ← refetch locale fields   │   │
│  │    → useHtmlLang watcher → document.documentElement.lang      │   │
│  │    → usePageTitle watcher → document.title                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Locale-Aware NocoDB Fields                                   │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  currentLocale() → i18n.global.locale.value                   │   │
│  │  Name field:  `Name (${locale})` → fallback `Name`            │   │
│  │  Notes field: `Notes (${locale})` → fallback `Notes`          │   │
│  │  Process cache keyed by: locale + forMapOnly + record count   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Translation Key Namespaces

```
┌──────────────────────────────────────────────────────────────┐
│  Key Structure (from locale JSON files)                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  app.title              → Application title                   │
│  nav.map                → Map navigation label                │
│  nav.list               → List navigation label               │
│  nav.about              → About navigation label              │
│  nav.close              → Close button label                  │
│                                                               │
│  project.state.finished        → "Abgeschlossen" / "Finished" │
│  project.state.underConstruction → "Im Bau" / "In Progress"   │
│  project.state.planned         → "Geplant" / "Planned"        │
│  project.detail.country   → "Land" / "Country"                │
│  project.detail.state     → "Status" / "Status"               │
│  project.detail.since     → "Seit" / "Since"                  │
│  project.detail.location  → "Standort" / "Location"           │
│  project.detail.description → "Beschreibung" / "Description"  │
│  project.detail.more      → "Mehr erfahren" / "Learn more"    │
│                                                               │
│  search.placeholder       → Search input placeholder           │
│  search.placeholderShort  → Short placeholder (modal)         │
│  search.filter            → Filter button label                │
│  search.filterGroups.status    → "Status"                     │
│  search.filterGroups.categories → "Kategorien" / "Categories" │
│  search.filterGroups.countries  → "Länder" / "Countries"      │
│  search.filterGroups.mapType    → "Kartentyp" / "Map Type"    │
│  search.mapTypes.satellite → "Satellit" / "Satellite"         │
│  search.mapTypes.map       → "Karte" / "Map"                  │
│  search.resultsCount       → "{count} Ergebnisse"             │
│  search.stats              → Project count stats              │
│  search.noResultsTitle     → No results heading               │
│  search.noResultsHint      → No results hint text             │
│  search.resetFilters       → Reset filters button             │
│  search.minChars           → Minimum characters hint          │
│  search.noResults          → No results message               │
│  search.resultsLabel       → ARIA label for results list      │
│  search.loadingMap         → Map loading text                 │
│  search.more               → "more" indicator                 │
│                                                               │
│  gallery.title            → Gallery title                     │
│                                                               │
│  map.layerFinished        → "Abgeschlossen ({count})"         │
│  map.layerUnderConstruction → "Im Bau ({count})"              │
│  map.layerPlanned         → "Geplant ({count})"               │
│                                                               │
│  a11y.*                   → Accessibility labels (see a11y    │
│                           specs for details)                  │
└──────────────────────────────────────────────────────────────┘
```

## Language Switcher UI

```
┌──────────────────────────────────────────────────────────────┐
│  MainMenu Language Switcher                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Languages:                                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐                                  │
│  │ 🇩🇪   │ │ 🇬🇧   │ │ 🇫🇷   │                                  │
│  │  DE  │ │  EN  │ │  FR  │                                  │
│  └──────┘ └──────┘ └──────┘                                  │
│                                                               │
│  Active language: highlighted with background + white border  │
│  Inactive languages: grayscale, 45% opacity                   │
│  Flag icons: flag-icons library (fi, fis, fi-{country})       │
│  Button lang attribute: set to language code                  │
│  ARIA label: Full language name (Deutsch, English, Français)  │
│  aria-current: "true" on active language                      │
└──────────────────────────────────────────────────────────────┘
```
