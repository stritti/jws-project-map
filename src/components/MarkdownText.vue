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

<style scoped lang="scss">
@use "@/assets/design-tokens.scss" as *;

.markdown-text {
  color: var(--color-on-surface);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-md);
  
  /* Headings - inherit from design system heading scales */
  h1 {
    font-size: var(--font-size-headline-lg);
    font-weight: var(--font-weight-headline-lg);
    line-height: var(--line-height-headline-lg);
    letter-spacing: var(--letter-spacing-headline-lg);
    margin-top: calc(var(--spacing-unit) * 4);
    margin-bottom: calc(var(--spacing-unit) * 2);

}
  
  h2 {
    font-size: var(--font-size-headline-md);
    font-weight: var(--font-weight-headline-md);
    line-height: var(--line-height-headline-md);
    letter-spacing: var(--letter-spacing-headline-md);
    margin-top: calc(var(--spacing-unit) * 4);
    margin-bottom: calc(var(--spacing-unit) * 2);
  }
  
  h3, h4, h5, h6 {
    font-size: var(--font-size-body-lg);
    font-weight: var(--font-weight-body-lg);
    line-height: var(--line-height-body-lg);
    margin-top: calc(var(--spacing-unit) * 3);
    margin-bottom: calc(var(--spacing-unit) * 1.5);
  }
  
  /* Paragraphs */
  p {
    margin-bottom: calc(var(--spacing-unit) * 3); /* 12px, close to 1.5em (~21px at 14px base) */
  }
  
  /* Links */
  a {
    color: var(--color-primary);
    text-decoration: none;
    
    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
  
  /* Lists */
  ul, ol {
    margin-bottom: calc(var(--spacing-unit) * 3);
    padding-left: calc(var(--spacing-unit) * 4);
    
    li {
      margin-bottom: calc(var(--spacing-unit) * 1);
    }
  }
  
  /* Blockquotes */
  blockquote {
    border-left: calc(var(--spacing-unit) * 2) solid var(--color-primary);
    padding-left: calc(var(--spacing-unit) * 3);
    margin-bottom: calc(var(--spacing-unit) * 3);
    color: var(--color-on-surface-variant);
    font-style: italic;
  }
  
  /* Code */
  code {
    background-color: var(--color-surface-variant);
    color: var(--color-on-surface);
    padding: calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 1);
    border-radius: var(--shape-round-default);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-body-md);
  }
  
  pre {
    background-color: var(--color-surface-variant);
    padding: calc(var(--spacing-unit) * 2);
    border-radius: var(--shape-round-default);
    overflow-x: auto;
    margin-bottom: calc(var(--spacing-unit) * 3);
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  /* Horizontal rules */
  hr {
    border: 0;
    height: 1px;
    background-color: var(--color-outline-variant);
    margin: calc(var(--spacing-unit) * 4) 0;
  }
  
  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: calc(var(--spacing-unit) * 3);
    
    th, td {
      border: 1px solid var(--color-outline);
      padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 1.5);
      text-align: left;
    }
    
    th {
      background-color: var(--color-surface-variant);
      font-weight: var(--font-weight-body-md);
    }
    
    tr:nth-child(even) {
      background-color: var(--color-background);
    }
  }
 
}
</style>
