import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { Country } from "@/interfaces/Country";
import countryService from "@/services/country.service";
import { currentLocale } from "@/utils/locale";

export const useCountryStore = defineStore("country", () => {
  const countries = ref<Country[]>([]);
  const initialized = ref(false);
  const loading = ref(false);

  const getAll = computed(() => countries.value);
  const getById = (id: number): Country | undefined =>
    countries.value.find((country) => country.id === id);
  /** Returns the country name in the current locale, falling back to the default Name */
  const getDisplayName = (id: number): string => {
    const c = countries.value.find((c) => c.id === id);
    if (!c) return "";
    const loc = currentLocale();
    const key = `name_${loc}` as keyof Country;
    return (c[key] as string) || c.name;
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
      const list = await countryService.getAll();
      countries.value = list as Array<Country>;
      // Only mark as initialized on success — allows retry on error
      initialized.value = true;
    } catch (error) {
      console.error("Error initializing country store:", error);
      // Do NOT set initialized = true — permits retry
    } finally {
      loading.value = false;
    }
  }

  return {
    countries,
    initialized,
    loading,
    getAll,
    getById,
    getDisplayName,
    load,
  };
});
