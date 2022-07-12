import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    loading: 0
  }),
  getters: {
    showLoadingSpinner: (state) => state.loading > 0
  },
  actions: {
    /**
     * Update Loading Spinner
     * @param {boolean} flag
     */
    updateLoading (flag) {
      if(flag) {
        this.loading++
      } else {
        this.loading--
      }
    }
  }
})