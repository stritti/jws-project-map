<template>
  <div v-if="compiled" v-html="compiled" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";

interface Props {
  text?: string | null;
}

const props = defineProps<Props>();

marked.setOptions({
  breaks: true,
  gfm: true,
});

const compiled = computed(() => {
  if (!props.text) return "";
  return marked.parse(props.text);
});
</script>
