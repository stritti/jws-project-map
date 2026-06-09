# src/plugins/

## Responsibility
Vue plugin configuration. Currently only contains the vue-i18n internationalization setup.

## Design
Single file: `i18n.ts`. Creates and exports the i18n instance:

- Uses `vue-i18n` with locale detection from `navigator.language` (falls back to `en`)
- Persists locale choice in `localStorage` under key `jws-locale`
- Loads locale JSON files from `src/locales/{de,en,fr}.json`
- Exports `setLocale()` function for runtime language switching
- Hard-coded supported locales: `de`, `en`, `fr`

## Flow
1. `main.ts` calls `app.use(i18n)`
2. Locale is auto-detected or loaded from localStorage
3. Components use `useI18n().t('key')` for all user-facing strings
4. `setLocale()` updates both the i18n instance and localStorage
5. `useHtmlLang()` in `useAccessibility.ts` watches locale changes and updates `<html lang>`

## Integration
- Used by: every component with user-facing text
- Consumed by: `main.ts` (app.use), `useAccessibility.ts` (html lang binding)
- Depends on: `vue-i18n` package
