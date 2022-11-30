<template>
  <b-button
    class="share-button"
    title="Navigate"
    aria-hidden="false"
    aria-label="Navigate"
    @click="navigate"
  >
    <bootstrap-icon icon="compass" variant="light" />
  </b-button>
</template>
<script>
import BootstrapIcon from '@dvuckovic/vue3-bootstrap-icons';

export default {
  name: 'NavigateButton',
  components: { BootstrapIcon },
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
        `https://www.google.com/maps/search/?api=1&query=${this.lat},${this.lng}`
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.share-button {
  z-index: 2;
}
</style>
