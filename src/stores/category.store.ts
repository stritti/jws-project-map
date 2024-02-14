import type { Category } from "@/interfaces/Category";
import { defineStore } from "pinia";
import categoryService from "../services/category.service";
import { useLoadingStore } from "./loading.store";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [] as Array<Category>,
  }),
  persist: true,
  getters: {
    getAll: (state) => state.categories as Array<Category>,
    getById: (state) => (id: string) =>
      state.categories.find(
        (category: Category) => category.id === id,
      ) as Category,
  },
  actions: {
    async init(): Promise<void> {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      categoryService.getAll().then((list) => {
        this.categories = list as Array<Category>;
        loadingStore.updateLoading(false);
      });
    },
  },
});
