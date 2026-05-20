## Context

The JWS Project-Map is a Vue 3 SPA that displays development projects on an interactive Leaflet map and in list/detail views. It uses BootstrapVueNext for UI components, Pinia for state, and vue-i18n for trilingual support (de/en/fr).

Current accessibility state:
- **Present**: Skip-to-content link, `prefers-reduced-motion` media query, scattered `aria-label` attributes, `role="listbox"/"option"` on search results, `.sr-only` utility class, `aria-live="polite"` on search result count
- **Missing**: No `<html lang>` binding, no page title updates, no focus-visible styles, no focus trap in modals, map is not keyboard-accessible, form inputs lack proper labels, heading hierarchy is inconsistent, color contrast not verified, many decorative icons lack `aria-hidden`

Constraints:
- No new npm dependencies — use native HTML/ARIA and existing BootstrapVueNext APIs
- Must work with the existing i18n system (de/en/fr)
- Must not break the iframe embedding mode (`useWebFrame`)
- BootstrapVueNext modals (`b-modal`) provide some built-in a11y but need explicit configuration

## Goals / Non-Goals

**Goals:**
- Achieve WCAG 2.1 AA compliance for all user-facing flows
- Make the application fully navigable via keyboard
- Ensure screen readers announce all meaningful content and state changes
- Provide accessible alternatives for all visual information (map, images, colors)
- Create reusable patterns (composables, CSS utilities) for future components

**Non-Goals:**
- No automated a11y testing infrastructure (e.g., axe-core integration) — left for a future change
- No redesign of visual components — accessibility is achieved through attributes, labels, and focus management, not layout changes
- No changes to NocoDB backend or data model
- No support for WCAG AAA (only AA target)

## Decisions

### 1. Centralize accessibility utilities in a composable + CSS file

**Decision**: Create `src/composables/useAccessibility.ts` for programmatic a11y helpers (page title updates, live region announcements, focus management) and `src/assets/a11y.scss` for CSS utilities (focus-visible, sr-only, high-contrast helpers).

**Rationale**: Keeps a11y logic co-located and reusable across components. CSS utilities avoid duplicating `.sr-only` patterns. A composable is idiomatic Vue 3 and works with `<script setup>`.

**Alternatives considered**:
- Vue plugin: Overkill for this scope; composable is simpler
- Per-component inline: Leads to duplication and inconsistency

### 2. Use BootstrapVueNext's built-in modal a11y with explicit configuration

**Decision**: Configure `b-modal` with `aria-label`, `header-close-label`, and `no-close-on-backdrop` where appropriate. Rely on BootstrapVueNext's built-in focus management but add explicit focus restore via the `useAccessibility` composable.

**Rationale**: BootstrapVueNext already implements WAI-ARIA dialog patterns. We augment rather than replace.

**Alternatives considered**:
- Custom focus trap: Unnecessary duplication; BootstrapVueNext handles this
- Third-party focus-trap library: Adds dependency for minimal gain

### 3. Map accessibility via overlay controls, not Leaflet internals

**Decision**: Add a "Skip to Map" link that focuses the map container, and provide keyboard-accessible overlay buttons for zoom/pan. Do not attempt to make Leaflet's internal canvas/tiles keyboard-navigable — instead, provide alternative list-based navigation via the project list view.

**Rationale**: Leaflet's tile layer is inherently visual and canvas-based. Making every map marker keyboard-focusable is complex and fragile. The project list view already provides an accessible alternative for discovering projects.

**Alternatives considered**:
- Custom Leaflet keyboard plugin: Adds complexity and maintenance burden
- Full keyboard map navigation: Not feasible for canvas-rendered tiles

### 4. i18n keys for accessibility labels

**Decision**: Add new translation keys under `a11y.*` namespace in all three locale files. Use descriptive key names like `a11y.skipToMap`, `a11y.mapInstructions`, `a11y.searchResultsAnnouncement`.

**Rationale**: Keeps a11y labels organized and translatable. Follows existing i18n conventions.

### 5. Heading hierarchy enforcement via component-level discipline, not runtime validation

**Decision**: Enforce heading hierarchy through code review and component design (each view has one `<h1>`, sections use `<h2>`, subsections use `<h3>`). Do not add runtime heading validation.

**Rationale**: Runtime validation adds bundle size and complexity. Heading hierarchy is a structural concern best addressed at the component level.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| BootstrapVueNext modal focus behavior may conflict with custom focus restore | Test all modals with screen readers; fall back to manual focus management if needed |
| Leaflet map remains partially inaccessible to keyboard-only users | Provide clear "Skip to Map" link and ensure project list view is a complete alternative |
| Color contrast changes may alter visual design | Use CSS custom properties for colors; adjust tokens in `design-tokens.scss` to meet 4.5:1 ratio |
| Translation keys for a11y labels may be missed in one language | Audit all three locale files (de/en/fr) together; use linting to catch missing keys |
| `aria-live` regions may announce too frequently, causing screen reader noise | Throttle announcements; use `aria-live="polite"` (not "assertive") for non-critical updates |
