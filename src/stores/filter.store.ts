import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useProjectStore } from "@/features/projects/stores/project.store";

export const useFilterStore = defineStore("filter", () => {
  const stateFilter = ref<string[]>([]);
  const categoryFilter = ref<number[]>([]);
  const countryFilter = ref<number[]>([]);
  const filterVisible = ref(false);

  function applyFilters() {
    const projectStore = useProjectStore();
    projectStore.doFilter(
      stateFilter.value,
      categoryFilter.value,
      countryFilter.value,
    );
  }

  // Re-apply filters when they change
  watch(
    [stateFilter, categoryFilter, countryFilter],
    applyFilters,
    { deep: true },
  );

  // Re-apply filters when project data loads (so filteredList gets populated)
  watch(
    () => useProjectStore().projects,
    (newProjects) => {
      if (newProjects.length > 0) {
        applyFilters();
      }
    },
    { deep: false },
  );

  return {
    stateFilter,
    categoryFilter,
    countryFilter,
    filterVisible,
    applyFilters,
  };
});
