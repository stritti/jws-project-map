<template>
  <markdown :source="text" breaks html typographer />
</template>

<script lang="ts">
import Markdown from "vue3-markdown-it";

import { defineComponent } from "vue";

export default defineComponent({
  name: "MarkdownText",
  components: {
    Markdown,
  },
  props: {
    text: {
      type: String,
      required: false,
      default: null,
    },
  },
});
</script>
