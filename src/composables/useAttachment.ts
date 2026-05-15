import { useProjectStore } from "@/features/projects/stores/project.store";
import type { Attachment } from "@/interfaces/Attachment";

const PLACEHOLDER = "/img/placeholder.png";

/**
 * Wraps attachment URL access with error handling and stale-data refresh.
 *
 * Usage in templates:
 *   <img :src="getBestUrl(attachment)" @error="onImageError" />
 */
export function useAttachment() {
  const store = useProjectStore();

  /**
   * Returns the best available URL from an attachment with fallback chain:
   * card_cover thumbnail → small thumbnail → original signedUrl → placeholder
   */
  function getBestUrl(attachment: Attachment | undefined | null): string {
    if (!attachment) return PLACEHOLDER;

    return (
      attachment.thumbnails?.card_cover?.signedUrl ||
      attachment.thumbnails?.small?.signedUrl ||
      attachment.signedUrl ||
      PLACEHOLDER
    );
  }

  /**
   * Returns the teaser image URL for a project (uses card_cover thumbnail if available).
   */
  function getTeaserUrl(project: {
    teaserImg?: Attachment[] | undefined;
  }): string {
    if (project.teaserImg && project.teaserImg.length > 0) {
      return getBestUrl(project.teaserImg[0]);
    }
    return PLACEHOLDER;
  }

  /**
   * Universal @error handler for images using attachment URLs.
   * Replaces broken images with a placeholder and triggers a background
   * store refresh if the data is likely stale.
   */
  function onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img || img.src === PLACEHOLDER) return;

    console.warn("[useAttachment] Image load failed, using placeholder:", img.src);
    img.src = PLACEHOLDER;

    // If data is older than 15 min, try refreshing in background
    if (store.lastFetched) {
      const age = Date.now() - store.lastFetched;
      if (age > 15 * 60 * 1000) {
        store.refreshIfStale();
      }
    }
  }

  return {
    getBestUrl,
    getTeaserUrl,
    onImageError,
    PLACEHOLDER,
  };
}
