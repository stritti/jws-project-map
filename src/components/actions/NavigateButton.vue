<template>
  <b-button
    :title="t('nav.navigate')"
    :aria-label="t('nav.navigate')"
    @click="navigate"
    class="navigate-button d-flex align-items-center justify-content-center"
  >
    <IBiPinMapFill /> Navigate &hellip;
  </b-button>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  lat: number;
  lng: number;
}>();

function navigate() {
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lng}`,
  );
}
</script>
<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.navigate-button {
  background-color: var(--color-secondary-container);
  color: var(--color-on-secondary);
  border: none;
  border-radius: var(--shape-round-default);
  padding: var(--spacing-unit);
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-label-md);
  line-height: var(--line-height-label-md);
  letter-spacing: var(--letter-spacing-label-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-unit);
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
  }
  
  /* Ensure icon inherits color and size */
  .ibi-pin-map-fill {
    font-size: 1.25rem; /* 20px, similar to fs-5 */
    color: inherit;
  }
}
</style>

