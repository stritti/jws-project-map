<template>
  <b-button
    v-if="isShareable"
    @click="shareDetails"
    class="share-button"
    title="share"
    aria-hidden="false"
    aria-label="Share"
  >
    <bootstrap-icon
      icon="share-fill"
      variant="light"
    />
  </b-button>
</template>
<script>
import BootstrapIcon from '@dvuckovic/vue3-bootstrap-icons'

export default {
  name: 'ShareButton',
  props: {
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fixed: {
      type: Boolean,
      default: true
    }
  },
  components: {BootstrapIcon},
  computed: {
    isShareable () {
      return 'share' in navigator
    }
  },
  methods: {
    shareDetails () {
      if (!this.isShareable) {
        return
      }
      const data = {
        title: this.title,
        text: this.text,
        url: this.url
      }
      navigator.share(data)
    }
  }
}
</script>
<style lang="scss" scoped>

.share-button {
  z-index: 2;
}
</style>
