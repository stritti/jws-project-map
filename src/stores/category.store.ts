import type { Category } from "@/interfaces/Category";
import { defineStore } from "pinia";
import categoryService from "../services/category.service";
import { useLoadingStore } from "./loading.store";

interface State {
  categories: Category[];
  initialized: boolean; // Flag to track initialization
}

export const useCategoryStore = defineStore("category", {
  state: (): State => ({
    categories: [],
    initialized: false, // Initialize as false
  }),
  persist: false,
  getters: {
    getAll: (state) => state.categories as Array<Category>,
    getById: (state) => (id: number) =>
      state.categories.find(
        (category: Category) => category.id === id,
      ) as Category,
  },
  actions: {
    async init(): Promise<void> {
      // Prevent re-initialization
      if (this.initialized) {
        return;
      }
      this.initialized = true; // Set flag immediately

      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      // Use async/await for cleaner error handling and flow
      try {
        const list = await categoryService.getAll();
        this.categories = list as Array<Category>;
      } catch (error) {
        console.error("Error initializing category store:", error);
      } finally {
        // Only update loading state here, list assignment happens in try block
        loadingStore.updateLoading(false);
      }
    },
  },
});
