# src/assets/

## Responsibility
Stylesheet assets. Contains the custom Bootstrap build, design tokens, and accessibility utilities.

## Design
Four SCSS files:

- **style-config.scss** — Bootstrap 5.3 custom build. Overrides `$primary` (#3d5e9e), sets font stack (Roboto), heading weights, border-radius tokens. Disables Bootstrap utility generation (`$utilities: ()`). Defines CSS custom properties (`--jws-primary`, `--jws-bg-subtle`, etc.) on `:root`. Imports Bootstrap core + BootstrapVueNext CSS.
- **a11y.scss** — Accessibility utilities: `.sr-only` (screen-reader-only), `:focus-visible` global outline (2px solid #3d5e9e), `:focus:not(:focus-visible)` outline removal, `.high-contrast-text`, `.skip-to-map` focusable skip link styles.
- **design-tokens.scss** — Additional design tokens including outline colors.
- **iframe.scss** — Styles for embedded iframe mode.

## Integration
- Imported by: `main.ts` (via SCSS imports in the Vite pipeline)
- a11y.scss is imported globally and affects all components
- Components use CSS custom properties and Bootstrap utility classes from this build
