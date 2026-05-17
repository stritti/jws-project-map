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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

import "./assets/iframe.scss";

const { isIFrame, notifyNavigate } = useWebFrame();
const loadingStore = useLoadingStore();
const router = useRouter();
const searchStore = useSearchStore();
const { isSearchVisible } = storeToRefs(searchStore);

const searchModalRef = ref<InstanceType<typeof SearchModal> | null>(null);

// Update page title on route changes
usePageTitle(router);

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

<style lang="scss">
body {
  font-family: Roboto, sans-serif !important;
  overflow-x: hidden;
}
h1 {
  color: rgb(61, 94, 158);
  font-size: 48px;
  font-weight: 300;

  @media screen and (max-width: 768px) {
    font-size: 24px;
  }
}
p {
  font-size: 16px;
  font-weight: 300;

  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
}

.container {
  margin-top: env(safe-area-inset-top);
  margin-bottom: env(safe-area-inset-bottom);
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex-grow: 1;
}

/* Global loading bar — thin animated bar at the very top of the viewport */
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  height: 3px;
  overflow: hidden;
  background: transparent;
}

.loader-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #3d5e9e, #6a8fd4, #3d5e9e);
  background-size: 200% 100%;
  animation: loader-slide 1.4s ease-in-out infinite;
}

@keyframes loader-slide {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skip-to-content link — visible only when focused via keyboard */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 10000;
  padding: 0.75rem 1.5rem;
  background: var(--color-secondary, #3d5e9e);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0 0 0.5rem 0;
  transition: top 0.1s ease;

  &:focus {
    top: 0;
    outline: 3px solid #fff;
    outline-offset: 2px;
  }
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Body lock — prevents iOS from scrolling the document when an input is
   focused on HomeView, which would otherwise misalign position:fixed elements
   such as the map and the search overlay.  Toggled via JS on mount/unmount. */
html.body-locked,
body.body-locked {
  height: 100% !important;
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
}
</style>
