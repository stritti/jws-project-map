<template>
  <b-button
    title="go back"
    class="back-button-inner d-flex align-items-center justify-content-center"
    @click="$router.go(-1)"
  >
    <IBiArrowLeft class="fs-5" />
  </b-button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BackButton",
});
</script>

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.back-button-inner {
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
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: var(--color-primary-container);
    color: var(--color-on-primary);
  }
  
  /* Ensure icon inherits color */
  .ibi-arrow-left {
    color: inherit;
    font-size: 1.25rem; /* 20px, matches fs-5 approx */
  }
}
</style>
