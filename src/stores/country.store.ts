import type { Country } from "@/interfaces/Country";
import { defineStore } from "pinia";
import countryService from "../services/country.service";
import { useLoadingStore } from "./loading.store";

interface State {
  countries: Country[];
}

export const useCountryStore = defineStore("country", {
  state: (): State => {
    return {
      countries: [],
    };
  },
  persist: true,
  getters: {
    getAll: (state) => state.countries,
    getById: (state) => (id: number) =>
      state.countries.find((country: Country) => country.id === id),
  },
  actions: {
    async init(): Promise<void> {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      countryService.getAll().then((list) => {
        this.countries = list as Array<Country>;
        loadingStore.updateLoading(false);
      });
    },
  },
});
