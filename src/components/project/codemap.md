# src/components/project/

## Responsibility
Components for displaying individual project data: list items, detail panels, and image galleries.

## Design
Four components:
- **ProjectListItem.vue** — Card in the list view: `b-card` with `b-card-img` (left-aligned, `object-fit: cover`), `b-card-body` with title, category badge, country, state badges. Click emits `select`. `aria-label` from project name.
- **ProjectDetails.vue** — Slide-out panel for quick project info from map marker click. Shows teaser text, category, country, state with a "Details" button linking to full view. Has close button.
- **ProjectGallery.vue** — Image thumbnail grid. Click opens ProjectGalleryModal. Keyboard accessible (`tabindex="0"`, `role="button"`, `:focus-visible` styles).
- **ProjectGalleryModal.vue** — Fullscreen image viewer overlay. `role="dialog"`, focus trapping, arrow key navigation, Escape to close, `aria-live` for image position announcement (`"Image X of Y"`).

## Flow
ProjectListItem receives `project` prop and displays it → click navigates to detail route.
ProjectDetails receives `project` prop from HomeView → close emits `close`.
ProjectGallery receives `project.gallery` images → click opens modal at selected index.
ProjectGalleryModal receives images + start index → keyboard/gesture navigation.

## Integration
- Used by: ProjectListView (ProjectListItem), HomeView (ProjectDetails), ProjectDetailView (ProjectGallery + ProjectGalleryModal)
- Depends on: `b-card`, `b-card-img`, `b-card-body`, `b-card-title`, `b-button` (all auto-imported)
- i18n via `useI18n`, a11y via `useAccessibility` (announceToScreenReader, useFocusRestore)
