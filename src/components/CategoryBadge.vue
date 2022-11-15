<template>
  <span
    v-if="categoryId"
    class="category-badge badge rounded-pill text-decoration-none"
    :style="categoryStyle"
    pill
  >{{displayName}}</span>
</template>

<script>
import { mapState } from 'pinia'
import { useCategoryStore } from '../store/category.store'

export default {
  name: 'CategoryBadge',
  props: {
    categoryId: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState(useCategoryStore, {
      getById: store => store.getById
    }),
    displayName () {
      return this.getById(this.categoryId).name
    },
    categoryStyle () {
      return `background-color: ${this.getById(this.categoryId).color};`
    }
  }
}
</script>

<style>
.category-badge {
  padding: 0.5rem 1rem;
  margin-right: 0.25rem;
}
</style>
