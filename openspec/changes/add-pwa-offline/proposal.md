## Why

The application is a Progressive Web App (PWA) that can be installed on users' devices, works offline with cached assets, and auto-updates when new versions are deployed. The PWA configuration uses `vite-plugin-pwa` with auto-update strategy, a web app manifest, and generated PWA assets. This capability needs documentation to ensure PWA behavior is maintained and future changes don't break installability or offline functionality.

## What Changes

- Document the VitePWA plugin configuration: autoUpdate strategy, manifest settings, dev options
- Specify the web app manifest: name, short_name, description, theme_color
- Document the PWA assets generation pipeline from `public/logo.svg`
- Specify the service worker behavior: auto-update on new version
- Document the Netlify SPA redirect configuration that supports PWA routing

## Capabilities

### New Capabilities
- `pwa-offline`: PWA configuration, service worker, web app manifest, installability, and offline support

## Impact

- **Build config affected**: `vite.config.ts`, `pwa-assets.config.ts`
- **Public assets affected**: `public/logo.svg`, generated PWA icons
- **Deployment affected**: `netlify.toml`, `public/_redirects`
- **No breaking changes**: Documentation-only change
