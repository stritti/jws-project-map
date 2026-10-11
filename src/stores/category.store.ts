import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { Category } from "@/interfaces/Category";
import categoryService from "@/services/category.service";
import { currentLocale } from "@/utils/locale";

export const useCategoryStore = defineStore("category", () => {
  const categories = ref<Category[]>([]);
  const initialized = ref(false);
  const loading = ref(false);

  const getAll = computed(() => categories.value);
  const getById = (id: number): Category | undefined =>
    categories.value.find((category) => category.id === id);
  /** Returns the category name in the current locale, falling back to the default Name */
  const getDisplayName = (id: number): string => {
    const cat = categories.value.find((c) => c.id === id);
    if (!cat) return "";
    const loc = currentLocale();
    const key = `name_${loc}` as keyof Category;
    return (cat[key] as string) || cat.name;
  };

  async function load(): Promise<void> {
    // Prevent re-initialization once successfully loaded
    if (initialized.value) {
      return;
    }
    if (loading.value) {
      return;
    }
    loading.value = true;
    try {
      const list = await categoryService.getAll();
      categories.value = list as Array<Category>;
      // Only mark as initialized on success — allows retry on error
      initialized.value = true;
    } catch (error) {
      console.error("Error initializing category store:", error);
      // Do NOT set initialized = true — permits retry
    } finally {
      loading.value = false;
    }
  }

  return {
    categories,
    initialized,
    loading,
    getAll,
    getById,
    getDisplayName,
    load,
  };
});
