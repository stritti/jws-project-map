import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const loading = ref(0);

  const showLoadingSpinner = computed(() => loading.value > 0);

  /** Update Loading Spinner */
  function updateLoading(flag: boolean): void {
    if (flag) {
      loading.value++;
    } else {
      loading.value--;
    }
  }

  return { loading, showLoadingSpinner, updateLoading };
});
