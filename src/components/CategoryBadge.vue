<template>
  <span
    v-if="categoryId"
    class="category-badge d-flex align-items-center"
    :style="categoryStyle"
    >{{ displayName }}</span
  >
</template>

<script lang="ts">
import { mapState } from "pinia";
import { useCategoryStore } from "../stores/category.store";
import { defineComponent } from "vue";

export default defineComponent({
  name: "CategoryBadge",
  props: {
    categoryId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState(useCategoryStore, {
      getById: (store) => store.getById,
      getDisplayName: (store) => store.getDisplayName,
    }),
    displayName() {
      return this.getDisplayName(this.categoryId);
    },
    categoryStyle() {
      const category = this.getById(this.categoryId);
      if (category && category.color) {
        // Active state: use category color for background, On Secondary for text
        return `
          background-color: ${category.color};
          color: var(--color-on-secondary);
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
      } else {
        // Inactive state: use Surface Variant for background, On Surface Variant for text
        return `
          background-color: var(--color-surface-variant);
          color: var(--color-on-surface-variant);
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
      }
    },
  },
});
</script>

<style lang="scss">
@use "@/assets/design-tokens.scss" as *;

/* Note: The styling is now handled inline via the categoryStyle computed property */
/* This allows us to use dynamic values from the category store while falling back to design tokens */
</style>
