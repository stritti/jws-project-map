import { ref } from "vue";
import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", () => {
  const isSearchVisible = ref(false);

  function openSearch(): void {
    isSearchVisible.value = true;
  }

  function closeSearch(): void {
    isSearchVisible.value = false;
  }

  function toggleSearch(): void {
    isSearchVisible.value = !isSearchVisible.value;
  }

  return { isSearchVisible, openSearch, closeSearch, toggleSearch };
});
