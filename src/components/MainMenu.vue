<template>
  <div class="main-menu-container">
    <div class="main-menu">
      <b-dropdown id="dropdown-dropup" dropup variant="primary" class="m-2">
        <template #button-content> <IBiList /> Menu </template>
        <b-dropdown-item to="/">
          <IBiGlobe2 class="me-2" /> Map
        </b-dropdown-item>
        <b-dropdown-item to="/project/">
          <IBiCardList class="me-2" /> List
        </b-dropdown-item>
        <b-dropdown-item @click="openSearch">
          <IBiSearch class="me-2" /> Search
          <kbd class="ms-2 shortcut-hint">Ctrl+K</kbd>
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item to="/about">
          <IBiInfoCircle class="me-2" /> About
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <search-modal ref="searchModal" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SearchModal from "@/components/SearchModal.vue";

const searchModal = ref<InstanceType<typeof SearchModal> | null>(null);

function openSearch() {
  searchModal.value?.show();
}
</script>

<style lang="scss" scoped>
.main-menu-container {
  z-index: 999;
  filter: drop-shadow(4px 4px 4px rgb(25, 25, 25));
}

.main-menu {
  display: inline-block;
}

.shortcut-hint {
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  padding: 1px 4px;
  color: inherit;
  vertical-align: middle;
}
</style>
