import { defineStore } from 'pinia';
import categoryService from '../services/category.service';
import { useLoadingStore } from './loading.store';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
  }),
  getters: {
    getAll: (state) => state.categories,
    getById: (state) => (id) =>
      state.categories.find((category) => category.id === id),
  },
  actions: {
    async init() {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      categoryService.getAll().then((list) => {
        this.categories = list;
        loadingStore.updateLoading(false);
      });
    },
  },
});
