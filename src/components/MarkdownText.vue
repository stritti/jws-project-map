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
  @apply text-onSurface text-body-md leading-body-md;
  
  /* Headings - inherit from design system heading scales */
  h1 {
    @apply text-headline-lg  leading-headline-lg tracking-headline-lg mt-[calc(var(--spacing-unit)*4)] mb-[calc(var(--spacing-unit)*2)];
  }
  
  h2 {
    @apply text-headline-md  leading-headline-md tracking-headline-md mt-[calc(var(--spacing-unit)*4)] mb-[calc(var(--spacing-unit)*2)];
  }
  
  h3, h4, h5, h6 {
    @apply text-body-lg  leading-body-lg mt-[calc(var(--spacing-unit)*3)] mb-[calc(var(--spacing-unit)*1.5)];
  }
  
  /* Paragraphs */
  p {
    @apply mb-[calc(var(--spacing-unit)*3)];
  }
  
  /* Links */
  a {
    @apply text-primary no-underline;
  }

  a:hover,
  a:focus {
    @apply underline;
  }
  
  /* Lists */
  ul, ol {
    @apply mb-[calc(var(--spacing-unit)*3)] pl-[calc(var(--spacing-unit)*4)];
    
    li {
      @apply mb-[calc(var(--spacing-unit)*1)];
    }
  }
  
  /* Blockquotes */
  blockquote {
    @apply border-l-[calc(var(--spacing-unit)*2)] border-l-primary pl-[calc(var(--spacing-unit)*3)] mb-[calc(var(--spacing-unit)*3)] text-onSurface-variant italic;
  }
  
  /* Code */
  code {
    @apply bg-surface-variant text-onSurface px-[calc(var(--spacing-unit)*0.5)] py-[calc(var(--spacing-unit)*1)] rounded-round-default  text-body-md;
  }
  
  pre {
    @apply bg-surface-variant p-[calc(var(--spacing-unit)*2)] rounded-round-default overflow-x-auto mb-[calc(var(--spacing-unit)*3)];
    
    code {
      @apply bg-transparent p-0;
    }
  }
  
  /* Horizontal rules */
  hr {
    @apply border-0 h-px bg-outline-variant my-[calc(var(--spacing-unit)*4)];
  }
  
  /* Tables */
  table {
    @apply border-collapse w-full mb-[calc(var(--spacing-unit)*3)];
    
    th, td {
      @apply border border-outline px-[calc(var(--spacing-unit)*1)] py-[calc(var(--spacing-unit)*1.5)] text-left;
    }
    
    th {
      @apply bg-surface-variant ;
    }
    
    tr:nth-child(even) {
      @apply bg-surface;
    }
  }
</style>
