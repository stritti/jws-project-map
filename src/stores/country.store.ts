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
  initialized: boolean; // Flag to track initialization
}

export const useCountryStore = defineStore("country", {
  state: (): State => {
    return {
      countries: [],
      initialized: false, // Initialize as false
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
      // Prevent re-initialization
      if (this.initialized) {
        return;
      }
      this.initialized = true; // Set flag immediately

      // Load data in background without blocking UI
      try {
        const list = await countryService.getAll();
        this.countries = list as Array<Country>;
      } catch (error) {
        console.error("Error initializing country store:", error);
      }
    },
  },
});
