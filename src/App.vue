<script setup lang="ts">
import SiteFooter from "./components/SiteFooter.vue";
import FloatingMeta from "./components/FloatingMeta.vue";
import SearchModal from "@/components/SearchModal.vue";
import { useWebFrame } from "./composables/useWebFrame";
import { useLoadingStore } from "@/stores/loading.store";
import { useSearchStore } from "@/stores/search.store";
import { storeToRefs } from "pinia";
import { computed, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { usePageTitle } from "./composables/useAccessibility";
import { useCanonicalUrl } from "./composables/useCanonicalUrl";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

import "./assets/iframe.css";

const { isIFrame, notifyNavigate } = useWebFrame();
const loadingStore = useLoadingStore();
const router = useRouter();
const searchStore = useSearchStore();
const { isSearchVisible } = storeToRefs(searchStore);

const searchModalRef = ref<InstanceType<typeof SearchModal> | null>(null);

// Update page title on route changes
usePageTitle(router);

// Canonical URL to prevent duplicate content
useCanonicalUrl(router);

const isLoading = computed(() => loadingStore.showLoadingSpinner);

// Hide main content from screen readers when search modal is open
const isMainHidden = computed(() => (isSearchVisible.value ? "true" : undefined));


// Watch for store changes to open the modal
watch(isSearchVisible, (isVisible) => {
  if (isVisible) {
    searchModalRef.value?.show();
  } else {
    searchModalRef.value?.hide();
  }
});

// Update store when modal is hidden locally (e.g., via Esc or clicking outside)
function onSearchHidden() {
  searchStore.closeSearch();
}

// Notify parent iframe about route changes
router.afterEach((to) => {
  if (isIFrame.value) {
    const projectId = to.params.projectId
      ? Number(to.params.projectId)
      : undefined;
    notifyNavigate(to.fullPath, projectId);
  }
});
</script>

<template>
  <!-- Skip-to-content link for keyboard users -->
  <a href="#main-content" class="skip-link">
    {{ t("a11y.skipToContent") }}
  </a>

  <!-- Global loading bar -->
  <div v-if="isLoading" class="global-loader" role="status" aria-label="Loading data">
    <div class="loader-bar"></div>
  </div>

  <div class="app-wrapper">
    <main id="main-content" class="content" aria-label="Main content" role="main" :aria-hidden="isMainHidden">
      <router-view />
    </main>
    <site-footer v-if="!isIFrame" />
    <floating-meta v-if="!isIFrame" />
    <search-modal ref="searchModalRef" @hidden="onSearchHidden" />
  </div>
</template>

<style lang="postcss">
body {
  @apply overflow-x-hidden;
}

.container {
  @apply safe-area-top safe-area-bottom;
}

.app-wrapper {
  @apply flex flex-col min-h-screen;
}

.content {
  @apply flex-grow;
}

/* Global loading bar — thin animated bar at the very top of the viewport */
.global-loader {
  @apply fixed top-0 left-0 right-0 z-[10001] h-0.5 overflow-hidden bg-transparent;
}

.loader-bar {
  @apply w-full h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[200%_100%] animate-loader-slide;
}

/* Skip-to-content link — visible only when focused via keyboard */
.skip-link {
  @apply absolute -top-full left-0 z-[10000] px-6 py-3 bg-primary text-white font-semibold rounded-b-round-default transition-all duration-100;
}

.skip-link:focus {
  @apply top-0 outline-[3px] outline-white outline-offset-2;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    @apply transition-none animation-none scroll-auto;
  }
}

/* Body lock — prevents iOS from scrolling the document when an input is
   focused on HomeView, which would otherwise misalign position:fixed elements
   such as the map and the search overlay.  Toggled via JS on mount/unmount. */
html.body-locked,
body.body-locked {
  @apply h-full overflow-hidden fixed w-full;
}
</style>
