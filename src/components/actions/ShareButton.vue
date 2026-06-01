<template>
  <b-button
    v-if="isShareable"
    :title="t('nav.share')"
    :aria-label="t('nav.share')"
    @click="shareDetails"
    class="share-button d-flex align-items-center justify-content-center"
  >
    <IBiShareFill /> Share &hellip;
  </b-button>
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
<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.share-button {
  background-color: transparent;
  color: var(--color-primary);
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
    background-color: var(--color-primary-container);
    color: var(--color-on-primary);
  }
  
  /* Ensure icon inherits color and size */
  .ibi-share-fill {
    font-size: 1.25rem; /* 20px, similar to fs-5 */
    color: inherit;
  }
}
</style>
