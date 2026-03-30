import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", {
  state: () => ({
    isSearchVisible: false,
  }),
  actions: {
    openSearch() {
      this.isSearchVisible = true;
    },
    closeSearch() {
      this.isSearchVisible = false;
    },
    toggleSearch() {
      this.isSearchVisible = !this.isSearchVisible;
    },
  },
});
