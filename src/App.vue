<script setup lang="ts">
import MainMenu from "./components/MainMenu.vue";
import SiteFooter from "./components/SiteFooter.vue";
import SearchModal from "@/components/SearchModal.vue";
import { useWebFrame } from "./composables/useWebFrame";
import { useSearchStore } from "@/stores/search.store";
import { storeToRefs } from "pinia";
import { watch, ref } from "vue";

const { isIFrame } = useWebFrame();
const searchStore = useSearchStore();
const { isSearchVisible } = storeToRefs(searchStore);

const searchModalRef = ref<InstanceType<typeof SearchModal> | null>(null);

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
</script>

<template>
  <div class="app-wrapper">
    <main class="content">
      <router-view />
    </main>
    <site-footer v-if="!isIFrame" />
    <nav>
      <main-menu v-if="!isIFrame" class="menu" />
    </nav>
    <search-modal ref="searchModalRef" @hidden="onSearchHidden" />
  </div>
</template>

<style lang="scss">
body {
  font-family: Roboto, sans-serif !important;
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

.menu {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  left: calc(1rem + env(safe-area-inset-left));
}
</style>
