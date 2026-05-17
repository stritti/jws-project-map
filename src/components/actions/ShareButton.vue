<template>
  <b-button
    v-if="isShareable"
    title="Share this Page"
    aria-label="Share this Page"
    @click="shareDetails"
    class="share-button d-flex align-items-center justify-content-center"
  >
    <IBiShareFill /> Share &hellip;
  </b-button>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ShareButton",
  props: {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fixed: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    isShareable() {
      return "share" in navigator;
    },
  },
  methods: {
    shareDetails() {
      if (!this.isShareable) {
        return;
      }
      const data = {
        title: this.title,
        text: this.text,
        url: this.url,
      };
      navigator.share(data);
    },
  },
});
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
