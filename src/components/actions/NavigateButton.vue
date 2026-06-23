<template>
  <button
    :title="t('nav.navigate')"
    :aria-label="t('nav.navigate')"
    @click="navigate"
    class="navigate-button flex items-center justify-center"
  >
    <IBiPinMapFill /> Navigate &hellip;
  </button>
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
<style lang="postcss" scoped>
.navigate-button {
  @apply bg-secondary-container text-on-secondary border-none rounded-round-default p-[var(--spacing-unit)] text-label-md  leading-label-md tracking-label-md inline-flex items-center justify-center gap-[var(--spacing-unit)] transition-[background-color,color] duration-200;
  
  &:hover {
    @apply bg-secondary text-on-secondary;
  }
  
  /* Ensure icon inherits color and size */
  .ibi-pin-map-fill {
    @apply text-[1.25rem] text-inherit;
  }
}
</style>

