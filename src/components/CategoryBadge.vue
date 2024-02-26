<template>
  <span
    v-if="categoryId"
    class="category-badge badge rounded-pill text-decoration-none"
    :style="categoryStyle"
    pill
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
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useCategoryStore, {
      getById: (store) => store.getById,
    }),
    displayName() {
      return this.getById(this.categoryId)
        ? this.getById(this.categoryId)?.name
        : "";
    },
    categoryStyle() {
      return this.getById(this.categoryId)
        ? `background-color: ${this.getById(this.categoryId)?.color};`
        : "";
    },
  },
});
</script>

<style lang="scss">
.category-badge {
  padding: 0.5rem 1rem 0.25rem 1rem;
  margin: 0.25rem 0.25rem 0.25rem 0;
}
</style>
