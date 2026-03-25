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
      type: Number,
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
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.8rem;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
