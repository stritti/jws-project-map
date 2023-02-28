import type { Category } from '@/interfaces/Category';
import { defineStore } from 'pinia';
import categoryService from '../services/category.service';
import { useLoadingStore } from './loading.store';

export const useCategoryStore = defineStore('category',  {
  state: () => ({
    categories: [] as Array<Category>
  }),
  getters: {
    getAll: (state) => state.categories,
    getById: (state) => (id: string) =>
      state.categories.find((category: Category) => category.id === id),
  },
  actions: {
    async init() {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      categoryService.getAll().then((list: Array<Category>) => {
        this.categories = list;
        loadingStore.updateLoading(false);
      });
    },
  },
});
