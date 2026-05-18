## Route Configuration

```
┌──────────────────────────────────────────────────────────────┐
│  Vue Router 5 Routes                                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Path              │ Name            │ Component              │
│  ──────────────────┼─────────────────┼──────────────────────  │
│  /                 │ home            │ HomeView (eager)       │
│  /project/         │ ProjectList     │ ProjectListView (lazy) │
│  /project/:id      │ ProjectDetail   │ ProjectDetailView(lazy)│
│  /about            │ (redirect)      │ → /                    │
│                                                               │
│  Chunk names:                                                 │
│    "project-list"   → ProjectListView.vue                     │
│    "project-detail" → ProjectDetailView.vue                   │
│                                                               │
│  History mode: createWebHistory (HTML5 history API)           │
│  Base title: "Jörg Wolff Foundation — Projects in West Africa"│
└──────────────────────────────────────────────────────────────┘
```

## Navigation Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Navigation System                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MainMenu (bottom-fixed)                                      │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Position: fixed, bottom: 0, full width                       │   │
│  │  Style: frosted glass (backdrop-filter: blur(16px))           │   │
│  │  Z-index: 999                                                 │   │
│  │                                                               │   │
│  │  Nav Items:                                                   │   │
│  │    /        → Map icon (bi/map, bi/map-fill when active)     │   │
│  │    /project → List icon (bi/list-ul, bi/list-check active)   │   │
│  │                                                               │   │
│  │  About Button: info-circle icon → opens AboutModal            │   │
│  │                                                               │   │
│  │  Language Switcher: DE | EN | FR flags                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Iframe-Aware Navigation (useWebFrame)                        │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │                                                               │   │
│  │  NOT in iframe:                                               │   │
│  │    router.push(path) → in-place navigation                    │   │
│  │                                                               │   │
│  │  IN iframe:                                                   │   │
│  │    1. notifyNavigate(path, projectId) → postMessage to parent │   │
│  │    2. window.open(url, '_blank') → open in new tab            │   │
│  │    (parent page stays in place)                               │   │
│  │                                                               │   │
│  │  Detection:                                                   │   │
│  │    1. URL param: ?embed=1 or ?iframe=1 → force iframe mode    │   │
│  │    2. window.self !== window.top → auto-detect                │   │
│  │    3. Cross-origin iframe → catch → assume iframe             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dynamic Page Titles (usePageTitle)                           │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Home (/)         → "{nav.map} — JWS Project Map"            │   │
│  │  List (/project/) → "{nav.list} — JWS Project Map"           │   │
│  │  Detail (/p/:id)  → "{project.name} — JWS Project Map"       │   │
│  │  Other            → "JWS Project Map"                         │   │
│  │                                                               │   │
│  │  Set on: route change (router.afterEach) + initial load       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Action Buttons                                               │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  BackButton:     router.back() or history navigation          │   │
│  │  ShareButton:    Web Share API with fallback (copy to clipbrd)│   │
│  │  NavigateButton: Google Maps link (lat, lng)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Iframe Communication Protocol

```
┌──────────────────────────────────────────────────────────────┐
│  postMessage Messages (IFrameMessage)                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Child → Parent:                                              │
│    { type: 'ready' }                    ← Sent on mount       │
│    { type: 'resize', height: number }   ← ResizeObserver      │
│    { type: 'navigateRequest',           ← User navigation     │
│      path: string, projectId?: number }                       │
│                                                               │
│  Parent → Child:                                              │
│    { type: 'navigate', path: string }   ← Parent navigation   │
│                                                               │
│  Auto-resize:                                                 │
│    ResizeObserver on #app element → reports height changes    │
│    Used by parent to adjust iframe height dynamically         │
│                                                               │
│  CSS when in iframe:                                          │
│    <html>.is-iframe → overscrollBehavior: none                │
│    SiteFooter hidden (v-if="!isIFrame")                       │
│    FloatingMeta hidden (v-if="!isIFrame")                     │
└──────────────────────────────────────────────────────────────┘
```

## Active State Logic

```
┌──────────────────────────────────────────────────────────────┐
│  MainMenu Active State                                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Nav Item          │ Active When                              │
│  ──────────────────┼────────────────────────────────────────  │
│  / (Map)           │ route.path === "/" (exact match)         │
│  /project (List)   │ route.path.startsWith("/project")        │
│                                                               │
│  Active styling:                                              │
│    - Icon switches to "filled" variant                        │
│    - Background: rgba(60, 93, 157, 0.12)                      │
│    - Font weight: 700                                         │
│    - aria-current="page"                                      │
│                                                               │
│  Inactive styling:                                            │
│    - Icon uses outline variant                                │
│    - Color: var(--color-on-surface-variant)                   │
│    - Hover: subtle background tint                            │
└──────────────────────────────────────────────────────────────┘
```
