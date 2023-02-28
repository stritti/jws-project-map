import type { Country } from '@/interfaces/Country';
import { defineStore } from 'pinia';
import countryService from '../services/country.service';
import { useLoadingStore } from './loading.store';

export const useCountryStore = defineStore('countries', {
  state: () => ({
    countries: null as Array<Country> | unknown
  }),
  getters: {
    getAll: (state) => state.countries,
    getById: (state) => (id: string) =>
      state.countries?.find((country: Country) => country.id === id),
  },
  actions: {
    async init() {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      countryService.getAll().then((list) => {
        this.countries = list;
        loadingStore.updateLoading(false);
      });
    },
  },
});
