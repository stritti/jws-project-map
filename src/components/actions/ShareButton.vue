<template>
  <b-button
    v-if="isShareable"
    class="share-button"
    title="Share this Page"
    aria-hidden="false"
    aria-label="Share this Page"
    @click="shareDetails"
  >
    <bootstrap-icon icon="share-fill" variant="light" />
  </b-button>
</template>
<script lang="ts">
import BootstrapIcon from "@dvuckovic/vue3-bootstrap-icons";

import { defineComponent } from "vue";

export default defineComponent({
  name: "ShareButton",
  components: { BootstrapIcon },
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
.share-button {
  z-index: 2;
}
</style>
