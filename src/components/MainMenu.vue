<script setup lang="ts">
import { useSearchStore } from "@/stores/search.store";

const searchStore = useSearchStore();

function openSearch() {
  searchStore.openSearch();
}
</script>

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
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.main-menu-container {
  z-index: 999;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px; /* Standard mobile nav height */
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-outline-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(4px 4px 4px rgba(25, 25, 25, 0.1));
}

.main-menu {
  display: inline-flex;
  align-items: center;
}

.b-dropdown {
  /* Override Bootstrap dropdown styles to match design system */
  --bs-btn-bg: transparent;
  --bs-btn-color: var(--color-on-surface);
  --bs-btn-border-color: transparent;
  --bs-btn-hover-bg: var(--color-primary-container);
  --bs-btn-hover-color: var(--color-on-primary);
  --bs-btn-active-bg: var(--color-primary);
  --bs-btn-active-color: var(--color-on-primary);
  --bs-btn-focus-box-shadow: 0 0 0 0.2rem rgba(9, 20, 38, 0.25);
  
  /* Ensure dropdown menu uses design tokens */
  --bs-dropdown-bg: var(--color-surface);
  --bs-dropdown-link-color: var(--color-on-surface);
  --bs-dropdown-link-hover-bg: var(--color-primary-container);
  --bs-dropdown-link-hover-color: var(--color-on-primary);
  --bs-dropdown-link-active-bg: var(--color-primary);
  --bs-dropdown-link-active-color: var(--color-on-primary);
  
  /* Border radius for dropdown items */
  --bs-dropdown-link-border-radius: var(--shape-round-default);
  
  /* Padding for dropdown items */
  --bs-dropdown-link-padding-y: calc(var(--spacing-unit) * 0.5);
  --bs-dropdown-link-padding-x: var(--spacing-unit);
  
  /* Font size for dropdown items */
  --bs-dropdown-link-font-size: var(--font-size-label-sm);
  --bs-dropdown-link-font-weight: var(--font-weight-label-sm);
}

.shortcut-hint {
  font-size: var(--font-size-label-sm);
  background: rgba(var(--color-on-surface-rgb), 0.2);
  border: 1px solid rgba(var(--color-on-surface-rgb), 0.4);
  border-radius: var(--shape-round-default);
  padding: calc(var(--spacing-unit) * 0.25) calc(var(--spacing-unit));
  color: inherit;
  vertical-align: middle;
  font-family: var(--font-family-inter);
  font-weight: var(--font-weight-label-sm);
  line-height: var(--line-height-label-sm);
  letter-spacing: var(--letter-spacing-label-sm);
}

/* Since we can't directly access RGB values in SCSS, we'll use the hex values with opacity */
.shortcut-hint {
  background: rgba(25, 28, 29, 0.2);
  border: 1px solid rgba(25, 28, 29, 0.4);
}

/* Icon styling */
.b-dropdown .ibi-list,
.b-dropdown .ibi-globe2,
.b-dropdown .ibi-card-list,
.b-dropdown .ibi-search,
.b-dropdown .ibi-infocircle {
  font-size: 1.25rem; /* 20px */
  transition: color 0.2s ease;
}

/* Active icon color */
.b-dropdown.show .ibi-list,
.b-dropdown.show .ibi-globe2,
.b-dropdown.show .ibi-card-list,
.b-dropdown.show .ibi-search,
.b-dropdown.show .ibi-infocircle {
  color: var(--color-on-primary);
}

/* Text label styling */
.b-dropdown .btn {
  font-size: var(--font-size-label-sm);
  font-weight: var(--font-weight-label-sm);
  line-height: var(--line-height-label-sm);
  letter-spacing: var(--letter-spacing-label-sm);
  padding: 0;
  text-transform: none;
  white-space: nowrap;
}

/* Adjust spacing between icon and text */
.b-dropdown .btn .me-2 {
  margin-right: var(--spacing-unit) !important;
}
</style>
