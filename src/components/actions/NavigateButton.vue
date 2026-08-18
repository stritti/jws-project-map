<template>
  <button
    :title="t('a11y.shareProject')"
    :aria-label="t('a11y.shareProject')"
    @click="navigate"
    @keydown.enter="navigate"
    @keydown.space.prevent="navigate"
    class="navigate-button flex items-center justify-center focus:outline-2 focus:outline-secondary focus:outline-offset-2"
  >
    <IBiPinMapFill aria-hidden="true" /> {{ t('nav.navigate') }}
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
  @apply bg-secondary text-white border-none rounded-round-default p-[var(--spacing-unit)] text-label-md  leading-label-md tracking-label-md inline-flex items-center justify-center gap-[var(--spacing-unit)] transition-[background-color,color] duration-200;
  
  &:hover {
    @apply bg-secondary text-white;
  }
  
  /* Ensure icon inherits color and size */
  .ibi-pin-map-fill {
    @apply text-[1.25rem] text-inherit;
  }
}
</style>

