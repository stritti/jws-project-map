import { ref, watch, type Ref } from "vue";
import { useProjectStore } from "@/features/projects/stores/project.store";
import type { Attachment } from "@/interfaces/Attachment";

const PLACEHOLDER = "/img/placeholder.png";

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
 * Reactive attachment URL wrapper.
 *
 * Returns a `url` ref that starts with the best available URL and switches
 * to `PLACEHOLDER` on error. The url auto-updates when the attachment ref
 * changes — all without mutating the DOM outside Vue's reactivity system.
 *
 * Usage in `<script setup>` components:
 *   const { url, onError } = useAttachmentUrl(computed(() => attachment))
 *   <img :src="url" @error="onError" />
 */
export function useAttachmentUrl(
  attachmentRef: Ref<Attachment | undefined | null>,
) {
  const url = ref(getBestUrl(attachmentRef.value));

  watch(attachmentRef, (newVal) => {
    url.value = getBestUrl(newVal);
  });

  function onError() {
    if (url.value !== PLACEHOLDER) {
      console.warn("[useAttachment] Image load failed, using placeholder");
      url.value = PLACEHOLDER;

      // Trigger background refresh if data is likely stale
      const store = useProjectStore();
      if (store.lastFetched) {
        const age = Date.now() - store.lastFetched;
        if (age > 15 * 60 * 1000) {
          store.refreshIfStale();
        }
      }
    }
  }

  return { url, onError, PLACEHOLDER };
}

/**
 * Standalone helpers (non-reactive, for simple use cases).
 */
export function useAttachment() {
  return {
    getBestUrl,
    PLACEHOLDER,
  };
}
