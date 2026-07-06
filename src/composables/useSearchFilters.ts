import { computed, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useFilterStore } from "@/stores/filter.store";
import { useCategoryStore } from "@/stores/category.store";
import { useCountryStore } from "@/stores/country.store";
import type { ProjectState } from "@/composables/useProjectSearch";

export interface FilterChip {
  id: string;
  type: string;
  name: string;
  value: string | number;
  category: "state" | "category" | "country";
}

/**
 * Shared composable for search/filter UI logic used by both HomeView
 * and ProjectListView.
 *
 * Centralises the duplicated computed properties and handler functions
 * that were previously copy-pasted across the two views.
 */
export function useSearchFilters(extraQueryRef?: Ref<string>) {
  const { t } = useI18n();
  const filterStore = useFilterStore();
  const categoryStore = useCategoryStore();
  const countryStore = useCountryStore();

  const { stateFilter, categoryFilter, countryFilter, filterVisible } =
    storeToRefs(filterStore);
  const { categories } = storeToRefs(categoryStore);
  const { countries } = storeToRefs(countryStore);

  // ── Options for state filter UI ───────────────────────────────
  const stateOptions = computed(() => [
    { text: t("project.state.finished"), value: "finished" as const },
    { text: t("project.state.underConstruction"), value: "under construction" as const },
    { text: t("project.state.planned"), value: "planned" as const },
  ]);

  // ── Category options with display names ────────────────────────
  const categoryList = computed(() =>
    categories.value.map((category) => ({
      text: categoryStore.getDisplayName(category.id),
      value: Number(category.id),
      ...category,
    })),
  );

  // ── Country options with display names ─────────────────────────
  const countryList = computed(() =>
    countries.value.map((country) => ({
      text: countryStore.getDisplayName(country.id),
      value: Number(country.id),
      ...country,
    })),
  );

  // ── Build active filter chip list ──────────────────────────────
  const activeFilters = computed<FilterChip[]>(() => {
    const filters: FilterChip[] = [];

    stateFilter.value.forEach((s) => {
      const opt = stateOptions.value.find((o) => o.value === s);
      if (opt) {
        filters.push({
          id: `state-${s}`,
          type: t("search.filterGroups.status"),
          name: opt.text,
          value: s,
          category: "state",
        });
      }
    });

    categoryFilter.value.forEach((c) => {
      const cat = categoryList.value.find((cl) => cl.value === c);
      if (cat) {
        filters.push({
          id: `cat-${c}`,
          type: t("search.filterGroups.categories"),
          name: cat.text,
          value: c,
          category: "category",
        });
      }
    });

    countryFilter.value.forEach((c) => {
      const cou = countryList.value.find((cl) => cl.value === c);
      if (cou) {
        filters.push({
          id: `cou-${c}`,
          type: t("search.filterGroups.countries"),
          name: cou.text,
          value: c,
          category: "country",
        });
      }
    });

    return filters;
  });

  const activeFiltersCount = computed(() => activeFilters.value.length);

  // ── Remove a single filter chip ────────────────────────────────
  function removeFilter(filter: FilterChip): void {
    if (filter.category === "state") {
      filterStore.stateFilter = filterStore.stateFilter.filter(
        (s) => s !== filter.value,
      );
    } else if (filter.category === "category") {
      filterStore.categoryFilter = filterStore.categoryFilter.filter(
        (c) => c !== filter.value,
      );
    } else if (filter.category === "country") {
      filterStore.countryFilter = filterStore.countryFilter.filter(
        (c) => c !== filter.value,
      );
    }
  }

  // ── Clear all active filters ───────────────────────────────────
  function clearAllFilters(): void {
    filterStore.stateFilter = [];
    filterStore.categoryFilter = [];
    filterStore.countryFilter = [];
    if (extraQueryRef) {
      extraQueryRef.value = "";
    }
  }

  // ── Handle state filter chip / dropdown change ─────────────────
  function handleStateFilterChange(state: ProjectState): void {
    if (state === "all") {
      filterStore.stateFilter = [];
    } else {
      filterStore.stateFilter = [state];
    }
  }

  return {
    stateOptions,
    categoryList,
    countryList,
    activeFilters,
    activeFiltersCount,
    stateFilter,
    categoryFilter,
    countryFilter,
    filterVisible,
    removeFilter,
    clearAllFilters,
    handleStateFilterChange,
  };
}
