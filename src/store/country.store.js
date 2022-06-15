import { defineStore } from 'pinia'
import countryService from '@/services/country.service'
import { useLoadingStore } from '@/store/loading.store'

export const useCountryStore = defineStore('countries', {
  state: () => ({
    countries: null
  }),
  getters: {
    getAll: state => state.countries,
    getById: (state) => (id) => state.countries.find((country) => country.id === id)
  },
  actions: {
    async init () {
      const loadingStore = useLoadingStore()
      loadingStore.updateLoading(true)
      countryService.getAll().then(list => {
        this.countries = list
        loadingStore.updateLoading(false)
      })
    }
  },
})
