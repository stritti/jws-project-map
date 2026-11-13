import { defineStore } from "pinia";
import type { Country } from "@/interfaces/Country";
import countryService from "@/services/country.service";
import { createLookupState } from "./lookup.store";

export const useCountryStore = defineStore("country", () => {
  const { items, initialized, loading, getById, getDisplayName, load } =
    createLookupState<Country>("country", () => countryService.getAll());

  return {
    countries: items,
    initialized,
    loading,
    getById,
    getDisplayName,
    load,
  };
});
