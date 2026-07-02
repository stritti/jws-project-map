<template>
  <div v-if="compiled" v-html="compiled" class="markdown-text" />
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

<style scoped lang="postcss">
.markdown-text {
  color: #191c1d;
  font-size: 14px;
  line-height: 20px;
}

/* Headings - inherit from design system heading scales */
.markdown-text h1 {
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-top: calc(var(--spacing-unit) * 4);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.markdown-text h2 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-top: calc(var(--spacing-unit) * 4);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.markdown-text h3,
.markdown-text h4,
.markdown-text h5,
.markdown-text h6 {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  margin-top: calc(var(--spacing-unit) * 3);
  margin-bottom: calc(var(--spacing-unit) * 1.5);
}

/* Paragraphs */
.markdown-text p {
  margin-bottom: calc(var(--spacing-unit) * 3);
}

/* Links */
.markdown-text a {
  color: #3d5e9e;
  text-decoration: none;
}

.markdown-text a:hover,
.markdown-text a:focus {
  text-decoration: underline;
}

/* Lists */
.markdown-text ul,
.markdown-text ol {
  margin-bottom: calc(var(--spacing-unit) * 3);
  padding-left: calc(var(--spacing-unit) * 4);
}

.markdown-text li {
  margin-bottom: calc(var(--spacing-unit) * 1);
}

/* Blockquotes */
.markdown-text blockquote {
  border-left: calc(var(--spacing-unit) * 2) solid #3d5e9e;
  padding-left: calc(var(--spacing-unit) * 3);
  margin-bottom: calc(var(--spacing-unit) * 3);
  color: #64748b;
  font-style: italic;
}

/* Code */
.markdown-text code {
  background-color: #e1e3e4;
  color: #191c1d;
  padding-left: calc(var(--spacing-unit) * 0.5);
  padding-right: calc(var(--spacing-unit) * 0.5);
  padding-top: calc(var(--spacing-unit) * 1);
  padding-bottom: calc(var(--spacing-unit) * 1);
  border-radius: 0.5rem;
  font-size: 14px;
}

.markdown-text pre {
  background-color: #e1e3e4;
  padding: calc(var(--spacing-unit) * 2);
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: calc(var(--spacing-unit) * 3);
}

.markdown-text pre code {
  background-color: transparent;
  padding: 0;
}

/* Horizontal rules */
.markdown-text hr {
  border: 0;
  height: 1px;
  background-color: #c5c6cd;
  margin-top: calc(var(--spacing-unit) * 4);
  margin-bottom: calc(var(--spacing-unit) * 4);
}

/* Tables */
.markdown-text table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: calc(var(--spacing-unit) * 3);
}

.markdown-text th,
.markdown-text td {
  border: 1px solid #75777d;
  padding-left: calc(var(--spacing-unit) * 1);
  padding-right: calc(var(--spacing-unit) * 1);
  padding-top: calc(var(--spacing-unit) * 1.5);
  padding-bottom: calc(var(--spacing-unit) * 1.5);
  text-align: left;
}

.markdown-text th {
  background-color: #e1e3e4;
}

.markdown-text tr:nth-child(even) {
  background-color: #f8f9fa;
}
</style>
