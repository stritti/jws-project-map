<template>
  <button
    :title="t('a11y.back')"
    :aria-label="t('a11y.back')"
    class="back-button-inner flex items-center justify-center focus:outline-2 focus:outline-secondary focus:outline-offset-2"
    @click="goBack"
  >
    <IBiArrowLeft aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useBackNavigation } from "@/composables/useBackNavigation";

const { t } = useI18n();
const { goBack } = useBackNavigation();
</script>

<style lang="postcss" scoped>
@reference "../../assets/main.css";

.back-button-inner {
  @apply flex items-center justify-center w-[36px] h-[36px] rounded-full border-none bg-transparent cursor-pointer p-0 transition-all duration-200 text-onSurface-variant;
  &:hover {
    @apply text-primary bg-secondary/10;
  }

  /* Ensure icon inherits color */
  :deep(svg) {
    @apply text-[1.25rem];
  }
}
</style>
