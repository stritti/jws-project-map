import type { Category } from "@/interfaces/Category";
import { defineStore } from "pinia";
import categoryService from "../services/category.service";
import { i18n } from "@/plugins/i18n";

function currentLocale(): string {
  try {
    return (i18n.global.locale as unknown as { value: string }).value || "en";
  } catch {
    return "en";
  }
}

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
    /** Returns the category name in the current locale, falling back to the default Name */
    getDisplayName: (state) => (id: number) => {
      const cat = state.categories.find((c) => c.id === id);
      if (!cat) return "";
      const loc = currentLocale();
      const key = `name_${loc}` as keyof Category;
      return (cat[key] as string) || cat.name;
    },
  },
  actions: {
    async load(): Promise<void> {
      // Prevent re-initialization
      if (this.initialized) {
        return;
      }
      this.initialized = true; // Set flag immediately

      // Load data in background without blocking UI
      try {
        const list = await categoryService.getAll();
        this.categories = list as Array<Category>;
      } catch (error) {
        console.error("Error initializing category store:", error);
      }
    },
  },
});
