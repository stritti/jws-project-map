## Why

Project galleries display teaser images and photo galleries sourced from NocoDB attachments. The attachment system uses a multi-tier URL resolution chain (card_cover thumbnail → small thumbnail → original signedUrl → placeholder), handles image load errors with fallback to placeholder, and triggers stale-data refresh when images fail to load. This capability needs documentation to ensure consistent image handling across the app.

## What Changes

- Document the attachment URL resolution chain and fallback strategy
- Specify the useAttachmentUrl composable: reactive URL binding, error handling, stale refresh trigger
- Document the ProjectGallery and ProjectGalleryModal components
- Specify the teaser image display in ProjectListItem and ProjectDetailView
- Document the attachment interface structure (signedUrl, thumbnails, mimeType, size, title)

## Capabilities

### New Capabilities
- `gallery-media`: Attachment handling, image URL resolution, gallery display, and error fallback

## Impact

- **Components affected**: `ProjectGallery.vue`, `ProjectGalleryModal.vue`, `ProjectListItem.vue`, `ProjectDetailView.vue`, `SearchModal.vue`
- **Composables affected**: `useAttachment`
- **Interfaces affected**: `Attachment`
- **No breaking changes**: Documentation-only change
