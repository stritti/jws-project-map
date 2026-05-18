## Why

The application serves a multilingual audience (German, English, French) reflecting the Jörg Wolff Foundation's international operations in West Africa. The i18n system touches every layer of the app: UI translations, locale-aware NocoDB field resolution, HTML lang attribute binding, browser locale detection, and persistent user preference. This capability needs documentation to ensure consistent localization behavior and guide future language additions.

## What Changes

- Document the vue-i18n configuration: legacy mode, fallback locale, message loading
- Specify the browser locale detection algorithm with whitelist validation
- Document the localStorage persistence strategy for user locale preference
- Specify the locale-aware NocoDB field resolution pattern in projectService
- Document the HTML lang attribute binding via useHtmlLang composable
- Specify the locale change flow: switchLocale → refetch project data → re-render

## Capabilities

### New Capabilities
- `i18n-localization`: Multilingual support infrastructure including vue-i18n setup, locale detection, persistence, and locale-aware data resolution

## Impact

- **Components affected**: All components using `useI18n()` or `t()` function
- **Services affected**: `projectService` (locale-aware field resolution)
- **Composables affected**: `useAccessibility` (useHtmlLang, usePageTitle)
- **No breaking changes**: Documentation-only change
