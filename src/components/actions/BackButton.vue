<template>
  <button
    title="go back"
    :aria-label="t('nav.back')"
    class="back-button-inner flex items-center justify-center"
    @click="goBack"
  >
    <IBiArrowLeft />
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "BackButton",
  setup() {
    const router = useRouter();
    const { t } = useI18n();

    function goBack() {
      // Use history.go(-1) if there is a previous app-internal entry,
      // otherwise fall back to the home page (handles direct deep-links).
      if (window.history.length > 1) {
        router.go(-1);
      } else {
        router.push("/");
      }
    }

    return { goBack, t };
  },
});
</script>

<style lang="postcss" scoped>
.back-button-inner {
  @apply bg-transparent text-primary border-none rounded-round-default p-[var(--spacing-unit)] text-label-md leading-label-md tracking-label-md inline-flex items-center justify-center transition-[background-color,color] duration-200;
  
  &:hover {
    @apply bg-primary text-on-primary;
  }
  
  /* Ensure icon inherits color */
  .ibi-arrow-left {
    @apply text-inherit text-[1.25rem];
  }
}
</style>
