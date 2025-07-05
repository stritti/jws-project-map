import type { Country } from "@/interfaces/Country";
import { defineStore } from "pinia";
import countryService from "../services/country.service";
import { useLoadingStore } from "./loading.store";

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
  },
  actions: {
    async load(): Promise<void> {
      // Prevent re-initialization
      if (this.initialized) {
        return;
      }
      this.initialized = true; // Set flag immediately

      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      // Use async/await for cleaner error handling and flow
      try {
        const list = await countryService.getAll();
        this.countries = list as Array<Country>;
      } catch (error) {
        console.error("Error initializing country store:", error);
      } finally {
        // Only update loading state here, list assignment happens in try block
        loadingStore.updateLoading(false);
      }
    },
  },
});
