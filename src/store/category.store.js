import { defineStore } from 'pinia'
import categoryService from '@/services/category.service'
import { useLoadingStore } from '@/store/loading.store'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: null
  }),
  getters: {
    getAll: state => state.categories,
    getById: (state) => (id) => state.categories.find((category) => category.id === id)
  },
  actions: {
    init () {
      const loadingStore = useLoadingStore()
      loadingStore.updateLoading(true)
      categoryService.getAll().then(list => {
        this.categories = list
        loadingStore.updateLoading(false)
      })
    }
  },
})
