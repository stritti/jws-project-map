<template>
  <span
    v-if="categoryId"
    class="category-badge flex items-center"
    :style="categoryStyle"
    >{{ displayName }}</span
  >
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCategoryStore } from "@/stores/category.store";
import { readableTextColor } from "@/utils/color";

const props = defineProps<{
  categoryId: number;
}>();

const categoryStore = useCategoryStore();

const displayName = computed(() => categoryStore.getDisplayName(props.categoryId));

const categoryStyle = computed(() => {
  const category = categoryStore.getById(props.categoryId);
  // Category colours come from NocoDB and are not curated, so the foreground
  // is chosen by measured contrast — hard-coded white is unreadable on light
  // category colours (white on #ff6a00 is 2.9:1).
  const backgroundColor = category?.color ?? "var(--color-surface-variant)";
  const color = category?.color
    ? readableTextColor(category.color)
    : "var(--color-on-surface-variant)";
  return `
    background-color: ${backgroundColor};
    color: ${color};
    border-radius: var(--shape-round-full);
    padding: calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit));
    font-size: var(--font-size-label-sm);
    font-weight: var(--font-weight-label-sm);
    line-height: var(--line-height-label-sm);
    letter-spacing: var(--letter-spacing-label-sm);
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
  `;
});
</script>

<style lang="postcss">
/* Note: The styling is now handled inline via the categoryStyle computed property */
/* This allows us to use dynamic values from the category store while falling back to design tokens */
</style>
