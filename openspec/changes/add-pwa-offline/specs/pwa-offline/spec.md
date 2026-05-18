## Requirements

### PWA Configuration

- SHALL use `vite-plugin-pwa` with `registerType: "autoUpdate"` for automatic service worker updates
- SHALL enable PWA in development mode (`devOptions.enabled: true`) for testing
- SHALL configure the web app manifest with:
  - `name`: "JWF Projects"
  - `short_name`: "JWF Projects"
  - `description`: "Overview of projects in Westafrica by JWF and Humanaktiv"
  - `theme_color`: "#3d5e9e"

### PWA Assets

- SHALL generate PWA icons from `public/logo.svg` source image
- SHALL use the `minimal2023Preset` for asset generation
- SHALL use the 2023 head link format for `<link>` tag injection
- SHALL provide a `generate-pwa-assets` script (`bun run generate-pwa-assets`) to regenerate icons

### Service Worker

- SHALL automatically update when a new version is deployed (autoUpdate strategy)
- SHALL NOT prompt the user for update confirmation
- SHALL serve cached assets when offline
- SHALL be generated automatically during the Vite production build

### SPA Routing

- SHALL configure Netlify redirects to serve `index.html` for all routes (`/* → /index.html 200`)
- SHALL support both `public/_redirects` and `netlify.toml` redirect configurations
- SHALL ensure client-side Vue Router routing works correctly on direct URL access and page refresh

### Installability

- SHALL be installable as a PWA on supported browsers (Chrome, Edge, Safari)
- SHALL display the app name and theme color in the install prompt
- SHALL use generated icons for the installed app icon

### Offline Support

- SHALL cache application assets via the service worker
- SHALL serve cached content when the network is unavailable
- SHALL auto-update cached assets when a new version is deployed
