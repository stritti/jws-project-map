<template>
  <b-button
    @click="navigate"
    class="share-button"
    title="Navigate"
    aria-hidden="false"
    aria-label="Navigate"
  >
    <bootstrap-icon
      icon="compass"
      variant="light"
    />
  </b-button>
</template>
<script>
import BootstrapIcon from '@dvuckovic/vue3-bootstrap-icons'

export default {
  name: 'NavigateButton',
  props: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  components: {BootstrapIcon},
  methods: {
    navigate () {
      window.open( `https://www.google.com/maps/search/?api=1&query=${this.lat},${this.lng}` )
    }
  }
}
</script>
<style lang="scss" scoped>

.share-button {
  z-index: 2;
}
</style>
