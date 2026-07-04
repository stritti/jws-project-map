import type { Country } from "@/interfaces/Country";
import { defineStore } from "pinia";
import countryService from "../services/country.service";
import { i18n } from "@/plugins/i18n";

function currentLocale(): string {
  try {
    return (i18n.global.locale as unknown as { value: string }).value || "en";
  } catch {
    return "en";
  }
}

interface State {
  countries: Country[];
  initialized: boolean;
}

export const useCountryStore = defineStore("country", {
  state: (): State => {
    return {
      countries: [],
      initialized: false,
    };
  },
  persist: false,
  getters: {
    getAll: (state) => state.countries,
    getById: (state) => (id: number) =>
      state.countries.find((country: Country) => country.id === id),
    getDisplayName: (state) => (id: number) => {
      const c = state.countries.find((c) => c.id === id);
      if (!c) return "";
      const loc = currentLocale();
      const key = `name_${loc}` as keyof Country;
      return (c[key] as string) || c.name;
    },
  },
  actions: {
    async load(): Promise<void> {
      // Prevent re-initialization once successfully loaded
      if (this.initialized) {
        return;
      }

      try {
        const list = await countryService.getAll();
        this.countries = list as Array<Country>;
        // Only mark as initialized on success — allows retry on error
        this.initialized = true;
      } catch (error) {
        console.error("Error initializing country store:", error);
        // Do NOT set initialized = true — permits retry
      }
    },
  },
});
