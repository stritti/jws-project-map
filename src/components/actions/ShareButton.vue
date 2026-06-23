<template>
  <button
    v-if="isShareable"
    :title="t('nav.share')"
    :aria-label="t('nav.share')"
    @click="shareDetails"
    class="share-button flex items-center justify-center"
  >
    <IBiShareFill /> Share &hellip;
  </button>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  title: string;
  text: string;
  url: string;
  fixed?: boolean;
}>();

const isShareable = computed(() => "share" in navigator);

function shareDetails() {
  if (!isShareable.value) return;
  navigator.share({
    title: props.title,
    text: props.text,
    url: props.url,
  });
}
</script>
<style lang="postcss" scoped>
.share-button {
  @apply bg-transparent text-primary border-none rounded-round-default p-[var(--spacing-unit)] text-label-md  leading-label-md tracking-label-md inline-flex items-center justify-center gap-[var(--spacing-unit)] transition-[background-color,color] duration-200;
  
  &:hover {
    @apply bg-primary text-on-primary;
  }
  
  /* Ensure icon inherits color and size */
  .ibi-share-fill {
    @apply text-[1.25rem] text-inherit;
  }
}
</style>
