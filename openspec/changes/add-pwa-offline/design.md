## PWA Configuration

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PWA Architecture                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  vite-plugin-pwa Configuration (vite.config.ts)               │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  registerType: "autoUpdate"                                   │   │
│  │    → Service worker auto-updates when new version detected    │   │
│  │    → No user prompt needed, updates applied on next load      │   │
│  │                                                               │   │
│  │  devOptions.enabled: true                                     │   │
│  │    → PWA works in development mode for testing                │   │
│  │                                                               │   │
│  │  Manifest:                                                    │   │
│  │    name:        "JWF Projects"                                │   │
│  │    short_name:  "JWF Projects"                                │   │
│  │    description: "Overview of projects in Westafrica by JWF    │   │
│  │                  and Humanaktiv"                              │   │
│  │    theme_color: "#3d5e9e"                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  PWA Assets Generation (pwa-assets.config.ts)                 │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Source: public/logo.svg                                      │   │
│  │  Preset: minimal2023Preset                                    │   │
│  │  Head link: 2023 format                                       │   │
│  │  Output: Generated icons in various sizes for:                │   │
│  │    - Apple touch icons                                        │   │
│  │    - Android/Chrome icons                                     │   │
│  │    - Favicon                                                  │   │
│  │    - Web manifest icons                                       │   │
│  │  Command: bun run generate-pwa-assets                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  SPA Routing Support (Netlify)                                │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  public/_redirects:  /* → /index.html 200                     │   │
│  │  netlify.toml: [[redirects]] rules for SPA                    │   │
│  │    → Ensures all routes serve index.html for client-side      │   │
│  │      routing to work correctly                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Service Worker Lifecycle (autoUpdate)

```
┌──────────────────────────────────────────────────────────────┐
│  autoUpdate Flow                                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. User loads app → SW v1 installed and activated            │
│  2. New deployment → SW v2 available                          │
│  3. SW v2 downloads in background                             │
│  4. SW v2 activates automatically (no user prompt)            │
│  5. Next page load → SW v2 serves new assets                  │
│  6. Old SW v1 cleaned up                                      │
│                                                               │
│  Key difference from promptUpdate:                            │
│    - No "New version available" banner                        │
│    - No user action required                                  │
│    - Update happens silently on next visit                    │
│    - Current session may use old assets until refresh         │
└──────────────────────────────────────────────────────────────┘
```

## Deployment Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  Build → Deploy Flow                                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  bun run build:prod                                           │
│    │                                                          │
│    ├─ vue-tsc --noEmit          (type check)                  │
│    ├─ vite build                (production build)            │
│    │   ├─ Generate SW           (vite-plugin-pwa)             │
│    │   ├─ Generate manifest     (vite-plugin-pwa)             │
│    │   └─ Inject PWA head links (vite-plugin-pwa)             │
│    └─ check-bundle-budget       (budget enforcement)          │
│                                                               │
│  Deploy to Netlify                                            │
│    │                                                          │
│    ├─ SPA redirects configured                                  │
│    ├─ Lighthouse CI runs                                      │
│    └─ PR comment with metrics (if via GitHub Actions)         │
└──────────────────────────────────────────────────────────────┘
```
