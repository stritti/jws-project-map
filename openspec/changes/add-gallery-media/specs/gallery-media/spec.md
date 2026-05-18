## Requirements

### Attachment URL Resolution

- SHALL resolve attachment URLs using the priority chain: card_cover thumbnail → small thumbnail → signedUrl → placeholder
- SHALL use `/img/placeholder.png` as the final fallback when no attachment or URL is available
- SHALL handle null/undefined attachments gracefully by returning the placeholder

### Reactive Attachment URLs

- SHALL provide a `useAttachmentUrl` composable that returns a reactive URL ref
- SHALL update the URL reactively when the source attachment changes
- SHALL provide an `onError` handler that switches to the placeholder on image load failure
- SHALL trigger a background data refresh via `refreshIfStale()` when an image fails to load and data is older than 15 minutes
- SHALL NOT switch to placeholder if already showing the placeholder (prevent redundant updates)

### Project Gallery

- SHALL display project teaser images and gallery attachments
- SHALL open a modal viewer when a gallery thumbnail is clicked
- SHALL be lazy-loaded via `defineAsyncComponent` to avoid initial bundle bloat
- SHALL handle projects with no gallery gracefully (not render)

### Gallery Modal

- SHALL display a full-screen image viewer with navigation between gallery items
- SHALL support keyboard navigation (arrow keys for previous/next)
- SHALL trap focus within the modal
- SHALL restore focus to the trigger element on close
- SHALL be lazy-loaded via `defineAsyncComponent`

### Teaser Image Display

- SHALL display the first teaser image in project list items using the small thumbnail
- SHALL display the first teaser image as a full-width background in the project detail view
- SHALL display teaser thumbnails in the search modal results
- SHALL use smaller thumbnails in list/search contexts to save bandwidth

### Attachment Interface

- SHALL support the NocoDB attachment structure with title, mimeType, size, url, signedUrl, path, signedPath
- SHALL support nested thumbnails with named variants (card_cover, small, etc.)
- SHALL handle null values for all optional fields

### Error Handling

- SHALL log image load failures to console with a warning
- SHALL fall back to placeholder image on load failure
- SHALL attempt background refresh when signed URLs are likely expired (data > 15 min old)
