<template>
  <markdown :source="text" breaks html typographer />
</template>

<script>
import Markdown from 'vue3-markdown-it';

export default {
  name: 'MarkdownText',
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
};
</script>

<style></style>
