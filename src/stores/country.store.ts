import type { Country } from "@/interfaces/Country";
import { defineStore } from "pinia";
import countryService from "../services/country.service";

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
