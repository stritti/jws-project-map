## Requirements

### i18n Configuration

- SHALL use vue-i18n in Composition API mode (legacy: false)
- SHALL support three locales: "de" (German), "en" (English), "fr" (French)
- SHALL load translation messages from `src/locales/{locale}.json`
- SHALL use "en" as the fallback locale
- SHALL provide type-safe locale type: `type Locale = "de" | "en" | "fr"`

### Locale Detection

- SHALL check localStorage for a saved locale preference under key "jws-locale"
- SHALL fall back to browser locale (navigator.language, first segment) if no saved preference
- SHALL validate detected locale against the whitelist ["de", "en", "fr"]
- SHALL default to "en" if no valid locale is found
- SHALL handle undefined navigator and localStorage gracefully (SSR safety)

### Locale Persistence

- SHALL save the user's locale preference to localStorage on every locale change
- SHALL load the saved locale preference on application initialization
- SHALL NOT persist the locale in Pinia (handled directly via localStorage)

### Locale-Aware Data Fields

- SHALL resolve NocoDB multilingual fields using the pattern `{FieldName} ({locale})`
- SHALL resolve `Name ({locale})` with fallback to `Name`
- SHALL resolve `Notes ({locale})` with fallback to `Notes`
- SHALL cache processed project data per locale to avoid redundant processing
- SHALL invalidate the process cache when locale changes

### Locale Change Flow

- SHALL update `i18n.global.locale.value` when the user selects a new locale
- SHALL save the new locale to localStorage
- SHALL trigger a background refetch of project data to load locale-specific fields
- SHALL update the `<html>` lang attribute via the useHtmlLang composable watcher
- SHALL update the document title via the usePageTitle composable watcher

### HTML Lang Attribute

- SHALL bind `document.documentElement.lang` to the current i18n locale
- SHALL update the lang attribute whenever the locale changes
- SHALL set the lang attribute on application initialization
- SHALL be callable from main.ts (outside component setup context)

### Translation Usage

- SHALL use the `t()` function from `useI18n()` in all components
- SHALL use interpolation for dynamic values (e.g., `t("search.resultsCount", { count: 5 })`)
- SHALL provide translation keys for all user-facing text
- SHALL NOT hardcode user-facing strings in components

### Language Switcher

- SHALL display flag icons for each supported language using flag-icons
- SHALL highlight the active language with a distinct visual style
- SHALL dim inactive languages (grayscale, reduced opacity)
- SHALL set the `lang` attribute on each language button
- SHALL provide ARIA labels with full language names
- SHALL set `aria-current="true"` on the active language button
