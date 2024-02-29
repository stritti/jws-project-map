<template>
  <b-button
    class="share-button"
    title="Navigate"
    aria-hidden="false"
    aria-label="Navigate"
    @click="navigate"
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
.share-button {
  z-index: 2;
}
</style>
