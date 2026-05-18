## Attachment URL Resolution

```
┌──────────────────────────────────────────────────────────────┐
│  URL Resolution Chain (getBestUrl)                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Attachment                                                   │
│    │                                                          │
│    ├─ thumbnails.card_cover.signedUrl  ← 1st priority         │
│    │                                                          │
│    ├─ thumbnails.small.signedUrl       ← 2nd priority         │
│    │                                                          │
│    ├─ signedUrl                      ← 3rd priority (original)│
│    │                                                          │
│    └─ /img/placeholder.png           ← fallback               │
│                                                               │
│  Note: NocoDB signed URLs have expiration. When they expire,  │
│  images fail to load, triggering the error handler which may  │
│  initiate a background data refresh.                          │
└──────────────────────────────────────────────────────────────┘
```

## useAttachmentUrl Composable

```
┌──────────────────────────────────────────────────────────────┐
│  useAttachmentUrl(attachmentRef: Ref<Attachment | null>)      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Returns:                                                     │
│    url: Ref<string>        ← Reactive URL, starts with best   │
│    onError: () => void     ← @error handler for <img>         │
│    PLACEHOLDER: string     ← Constant "/img/placeholder.png"  │
│                                                               │
│  Behavior:                                                    │
│    1. Initialize url with getBestUrl(attachmentRef.value)     │
│    2. Watch attachmentRef → update url when attachment changes│
│    3. onError() → switch to PLACEHOLDER if not already        │
│    4. onError() → if data is > 15 min old, trigger refresh    │
│                                                               │
│  Usage:                                                       │
│    const { url, onError } = useAttachmentUrl(computed(...))   │
│    <img :src="url" @error="onError" />                        │
└──────────────────────────────────────────────────────────────┘
```

## Gallery Components

```
┌──────────────────────────────────────────────────────────────┐
│  ProjectGallery                                               │
│  ─────────────────────────────────────────────────────────── │
│  Input: project (Project), title (string)                     │
│  Displays: Teaser image + gallery thumbnails in a grid        │
│  Opens: ProjectGalleryModal on thumbnail click                │
│  Lazy-loaded via defineAsyncComponent                         │
├──────────────────────────────────────────────────────────────┤
│  ProjectGalleryModal                                          │
│  ─────────────────────────────────────────────────────────── │
│  Input: project (Project), title (string)                     │
│  Displays: Full-screen modal with large image viewer          │
│  Navigation: Previous/Next buttons, keyboard arrows           │
│  Focus: Trap focus, restore on close                          │
│  Lazy-loaded via defineAsyncComponent                         │
└──────────────────────────────────────────────────────────────┘
```

## Image Display Contexts

```
┌──────────────────────────────────────────────────────────────┐
│  Where Images Are Used                                        │
├──────────────────┬───────────────────────────────────────────┤
│  Context         │ Image Source                               │
├──────────────────┼───────────────────────────────────────────┤
│  ProjectListItem │ teaserImg[0] → small thumbnail             │
│  SearchModal     │ teaserImg[0] → small → card_cover → signed │
│  ProjectDetail   │ teaserImg[0] → signedUrl (background)      │
│  ProjectGallery  │ teaserImg + gallery → card_cover/small     │
│  SearchResults   │ teaserImg[0] → small thumbnail             │
│  (dropdown)      │                                           │
└──────────────────┴───────────────────────────────────────────┘
```

## Attachment Interface

```typescript
interface Attachment {
  title: string | null;
  mimeType: string | null;
  size: number | null;
  url?: string | null;
  signedUrl?: string | null;
  path?: string | null;
  signedPath?: string | null;
  thumbnails?: {
    card_cover?: { signedUrl?: string };
    small?: { signedUrl?: string };
    [key: string]: { signedUrl?: string } | undefined;
  };
}
```

## Stale Data Refresh on Image Error

```
Image fails to load (@error)
    │
    ▼
onError() → switch to PLACEHOLDER
    │
    ▼
Check: is data older than 15 minutes?
    │
    ├── Yes → projectStore.refreshIfStale()
    │         (background refetch to get fresh signed URLs)
    │
    └── No → just show placeholder, no refresh
```
