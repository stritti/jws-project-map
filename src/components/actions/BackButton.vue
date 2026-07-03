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
