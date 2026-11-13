import { ref, type Ref } from "vue";
import { currentLocale } from "@/utils/locale";

export interface LookupEntry {
  id: number;
  name: string;
}

/**
 * Shared state and actions for the small lookup stores (categories,
 * countries): load-once guard, id lookup, and locale-aware display name.
 */
export function createLookupState<T extends LookupEntry>(
  storeName: string,
  loadAll: () => Promise<T[]>,
) {
  const items: Ref<T[]> = ref([]);
  const initialized = ref(false);
  const loading = ref(false);

  const getById = (id: number): T | undefined =>
    items.value.find((item) => item.id === id);

  /** Returns the entry name in the current locale, falling back to the default name */
  const getDisplayName = (id: number): string => {
    const item = getById(id);
    if (!item) return "";
    const key = `name_${currentLocale()}` as keyof T;
    return (item[key] as string) || item.name;
  };

  async function load(): Promise<void> {
    // Prevent re-initialization once successfully loaded
    if (initialized.value || loading.value) {
      return;
    }
    loading.value = true;
    try {
      items.value = await loadAll();
      // Only mark as initialized on success — allows retry on error
      initialized.value = true;
    } catch (error) {
      console.error(`Error initializing ${storeName} store:`, error);
      // Do NOT set initialized = true — permits retry
    } finally {
      loading.value = false;
    }
  }

  return { items, initialized, loading, getById, getDisplayName, load };
}
