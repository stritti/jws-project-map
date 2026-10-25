# Performance-Analyse — JWS Project Map

Analyse des Production-Builds (`bun run build:prod`, Vite 7, Stand: Version 1.3.x).
Alle Angaben gzip-Größen, gemessen am lokalen Build (`dist/`).

## 1. Ist-Zustand (Bundling)

| Bereich | Größe (raw) | Größe (gzip) | Bewertung |
|---|---|---|---|
| JavaScript gesamt (20 Chunks) | ~850 kB | **267 kB** | ✅ gut |
| Davon: `vendor-leaflet` (lazy) | 451 kB | 138 kB | ✅ korrekt lazy geladen |
| CSS initial (`index-*.css`) | 513 kB | 116 kB | ⚠️ siehe 3.2 |
| Flag-SVGs (`assets/svg/`, 142 Dateien) | 3.456 kB | **1.112 kB** | 🔴 siehe 3.1 |
| Gesamtes `dist/` (inkl. SW-Precache) | 5,6 MB | — | 🔴 PWA precacht alles |

Bundle-Budget-Check (`scripts/check-bundle-budget.cjs`) ist grün:
Initial-JS ≤ 300 kB gzip, Async-Chunks ≤ 150 kB, CSS ≤ 500 kB.

Die größten JS-Chunks:

| Chunk | gzip | Bemerkung |
|---|---|---|
| `vendor-leaflet` | 138,2 kB | lazy via `defineAsyncComponent` in `HomeView.vue` ✅ |
| `MarkdownText` | 25,2 kB | lazy in `ProjectDetailView.vue` ✅ |
| `useAccessibility` | 23,5 kB | initial — prüfen |
| `index` (App-Code) | 23,1 kB | initial |
| `vendor-axios` | 18,8 kB | initial |

## 2. Was bereits gut umgesetzt ist

- Leaflet + MarkerCluster werden per dynamischem `import()` geladen (`LocationMap.vue:128–130`)
- `MarkdownText` (marked) ist async (`ProjectDetailView.vue:212`)
- Router-Code-Splitting für Views aktiv
- Manual-Chunks für Vue, Router, Pinia, Leaflet, Axios → gute Cache-Stabilität
- Bundle-Budget-Gate in CI vorhanden

## 3. Verbesserungsvorschläge (nach Impact sortiert)

### 3.1 🔴 PWA-Precache lädt alle 142 Flag-SVGs (~3,4 MB / 1,1 MB gzip)

**Problem:** `vite.config.ts:90` precacht `**/*.{js,css,html,ico,png,svg,woff2}`. Der
`flag-icons`-Import in `src/main.ts:18` zieht die CSS-Datei mit **allen** Länderflaggen
beider Varianten (4x3 und 1x1) ins Bundle — darunter riesige SVGs wie
`rs-*.svg` (177 kB) und `bo-*.svg` (102 kB). Die App zeigt aber nur Projekte in
Westafrica (wenige Länder). Beim ersten Besuch wird der Service-Worker-Install
dadurch massiv aufgebläht.

**Vorschläge:**

1. **flag-icons auf benötigte Länder reduzieren:** Statt des vollständigen CSS
   nur die tatsächlich verwendeten `fi-<code>`-Klassen generieren (z. B. per
   Build-Script aus `country.store`/NocoDB-Daten oder statische Allowlist der
   Westafrika-Länder `bj bf cv ci gh gm gn lr ml ng sn sl tg`).
   Erwartete Ersparnis: **> 3 MB precache, ~1 MB Transfer**.
2. **Alternativ/minimal:** `globPatterns` des Workbox-Precaches auf die wirklich
   benötigten Assets begrenzen, z. B. SVGs der Flags via `runtimeCaching`
   (CacheFirst) statt Precache, oder `globIgnores: ["**/assets/svg/**"]`, wenn
   Flags on-demand über CSS `background-image` geladen werden.

### 3.2 ⚠️ Initiales CSS: 513 kB raw (116 kB gzip)

`index-*.css` enthält Bootstrap (custom build), Tailwind Utilities und das
flag-icons-CSS. 116 kB gzip sind für die Initial-Render-Zeit noch im Rahmen,
aber das flag-icons-CSS (~150 kB raw) entfällt fast vollständig mit 3.1.

**Vorschlag:** Nach 3.1 den Tailwind/Bootstrap-Anteil prüfen
(`@reference`-Nutzung in Components ist bereits sauber), zudem
`cssCodeSplit: true` (Vite-Default) nicht deaktivieren.

### 3.3 ⚠️ `useAccessibility`-Chunk (23,5 kB gzip) im Initial-Bundle

Wird dieser Composable direkt beim Start gebraucht? Falls ja OK; falls er nur
von Modals/Lazy-Routen genutzt wird, sollte der Import dynamisch erfolgen.

**Vorschlag:** Aufrufstellen prüfen und ggf. `import()` nutzen.

### 3.4 💡 Kleineres Einsparpotenzial

- **font-display / Preload:** Keine Webfonts im Bundle (`woff2`-Pattern greift ins Leere) — Fonts kommen offenbar von CDN; `preconnect` prüfen.
- **LCP-Optimierung Home:** Home rendert Karte async; LCP wird vermutlich vom Hero/Header dominiert. Bei Bedarf `fetchpriority="high"` für das Header-/Hero-Bild.
- **`skipWaiting: true` + `clientsClaim: true`:** Für die PWA ok, aber mit
  reduziertem Precache (3.1) kombinieren, sonst lange Installationsphase.

## 4. Messbarkeit

Die Lighthouse-CI (`performance.yml`) misst statisch gegen `dist/`. Werte wie
`total-byte-weight` (~5,6 MB über Budget-Warnung 500 kB) werden primär durch 3.1
getrieben — nach Umsetzung sollte die Warnung deutlich besser aussehen.
Empfehlung: nach 3.1 die Warnung auf `error` mit ~1,5 MB Deckelung anheben.

## 5. Priorisierte Roadmap

| Prio | Maßnahme | Aufwand | Erwarteter Effekt |
|---|---|---|---|
| 1 | Flag-SVGs auf genutzte Länder reduzieren (3.1) | M | −3 MB Precache, −1 MB gzip Transfer, SW-Install deutlich schneller |
| 2 | flag-icons-CSS trimmen (Teil von 3.1) | S | kleineres Initial-CSS (~−150 kB raw) |
| 3 | `useAccessibility` lazy prüfen (3.3) | S | −23 kB Initial-JS (falls lazy möglich) |
| 4 | Budget für `total-byte-weight` nachziehen (4) | XS | CI deckt Regressionen ab |
