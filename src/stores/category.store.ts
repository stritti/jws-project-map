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
  initialized: boolean;
}

export const useCategoryStore = defineStore("category", {
  state: (): State => ({
    categories: [],
    initialized: false,
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
      // Prevent re-initialization once successfully loaded
      if (this.initialized) {
        return;
      }

      try {
        const list = await categoryService.getAll();
        this.categories = list as Array<Category>;
        // Only mark as initialized on success — allows retry on error
        this.initialized = true;
      } catch (error) {
        console.error("Error initializing category store:", error);
        // Do NOT set initialized = true — permits retry
      }
    },
  },
});
