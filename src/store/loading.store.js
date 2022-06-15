import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    loading: false
  }),
  getters: {
    showLoadingSpinner: (state) => state.loading > 0
  },
  actions: {
    /**
     * Update Loading Spinner
     * @param {boolean} loading
     */
    updateLoading (loading) {
      if(loading) {
        this.loading++
      } else {
        this.loading--
      }
    }
  }
})