<template>
  <markdown
    :source="text"
    breaks
    html
    typographer
  />
</template>

<script>
import Markdown from 'vue3-markdown-it';

export default {
  name: 'MarkdownText',
  props: {
    text: {
      type: String,
      required: false
    }
  },
  components: {
    Markdown
  }
}
</script>

<style>

</style>