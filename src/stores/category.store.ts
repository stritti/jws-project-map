import { defineStore } from "pinia";
import type { Category } from "@/interfaces/Category";
import categoryService from "@/services/category.service";
import { createLookupState } from "./lookup.store";

export const useCategoryStore = defineStore("category", () => {
  const { items, initialized, loading, getById, getDisplayName, load } =
    createLookupState<Category>("category", () => categoryService.getAll());

  return {
    categories: items,
    initialized,
    loading,
    getById,
    getDisplayName,
    load,
  };
});
