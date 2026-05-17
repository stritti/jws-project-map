<template>
  <b-button
    title="Navigate"
    aria-label="Navigate"
    @click="navigate"
    class="navigate-button d-flex align-items-center justify-content-center"
  >
    <IBiPinMapFill /> Navigate &hellip;
  </b-button>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavigateButton",
  props: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  methods: {
    navigate() {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${this.lat},${this.lng}`,
      );
    },
  },
});
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

