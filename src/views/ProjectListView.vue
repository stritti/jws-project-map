<template>
  <div class="container mx-auto px-4">
    <div class="project-list">
      <div class="list-header" :class="{ 'header-scrolled': headerScrolled }">
        <h1>{{ t("app.title") }}</h1>

        <div v-if="isDataLoading" class="skeleton-grid">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="skeleton-card">
              <div class="flex h-full">
                <div class="w-5/12 skeleton-image-col">
                  <div class="skeleton-image"></div>
                </div>
                <div class="w-7/12 skeleton-content-col">
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-category" style="width: 65%"></div>
                    <div class="skeleton-country" style="width: 45%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <h3 class="my-3 text-onSurface-variant text-body-lg">
            {{ t("search.stats", { total: projectCount, ub: projectsUnderConstructionCount, pl: projectsPlannedCount }) }}
          </h3>
        </div>
      </div><!-- /.list-header -->

      <!-- Filter overlay – position:fixed on mobile (bottom) so it must NOT be
           inside .list-header (which has backdrop-filter that breaks fixed
           positioning in Chrome).  On desktop it flows in normal document order. -->
      <div class="filter-overlay-container" :class="{ 'search-active': isSearchActive }">
        <div class="toolbar-section">
          <SearchBar
            v-model="searchQuery"
            v-model:state-filter="stateFilterSearch"
            :placeholder="t('search.placeholder')"
            :filter-label="t('search.filter')"
            :show-filter-chips="false"
            :filter-count="activeFiltersCount"
            :filter-visible="filterVisible"
            view-mode="list"
            @filter-click="filterVisible = !filterVisible"
            @state-change="handleStateFilterChange"
            @view-change="() => $router.push('/')"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          />
        </div>

        <!-- Filter backdrop (mobile only) -->
        <div v-if="filterVisible" class="filter-backdrop" @click="filterVisible = false" />

        <!-- Filter panel overlays the list via absolute positioning -->
        <FilterPanel v-if="filterVisible" @close="filterVisible = false" />
      </div>
      <div class="mb-4 text-onSurface-variant text-body-md" v-if="filteredProjectList.length !== finalProjectList.length || activeFiltersCount > 0 || searchQuery">
        {{ t("search.resultsCount", { count: finalProjectList.length }) }}
      </div>
      <!-- Screen reader announcement for filter result count -->
      <div class="sr-only" role="status" aria-live="polite">
        {{ t("a11y.filterResultsAnnouncement", { count: finalProjectList.length }) }}
      </div>
      <div v-if="!isDataLoading" class="my-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="project in finalProjectList"
          :key="project.id"
          class="h-full"
        >
          <project-list-item
            :project="project"
            :to="projectRoute(project)"
            class="h-full"
          />
        </div>
        <div v-if="finalProjectList.length === 0" class="no-results py-5 text-center">
          <div class="text-[4rem] text-onSurface-variant opacity-25 mb-4">
            <IBiEmojiDizzy />
          </div>
          <h3>{{ t("search.noResultsTitle") }}</h3>
          <p class="text-onSurface-variant">{{ t("search.noResultsHint") }}</p>
          <button @click="clearAllFilters" class="mt-3 btn btn-outline-primary">
            {{ t("search.resetFilters") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useLoadingStore } from "../stores/loading.store";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";
import { useFilterStore } from "../stores/filter.store";
import type { Project } from "@/interfaces/Project";
import ProjectListItem from "../components/project/ProjectListItem.vue";
import { useProjectSearch, type ProjectState } from "@/composables/useProjectSearch";
import FilterPanel from "@/components/FilterPanel.vue";
import SearchBar from "../components/SearchBar.vue";
import { projectRoute } from "@/utils/slug";

const { t } = useI18n();
const loadingStore = useLoadingStore();
const projectStore = useProjectStore();
const categoryStore = useCategoryStore();
const countryStore = useCountryStore();
const filterStore = useFilterStore();

const { showLoadingSpinner } = storeToRefs(loadingStore);
const { filteredList: filteredProjectList, projects } =
  storeToRefs(projectStore);

// Show skeleton only while no data has arrived yet; once projects are available
// images can load asynchronously without blocking the list.
const isDataLoading = computed(() => showLoadingSpinner.value && projects.value.length === 0);
const { categories } = storeToRefs(categoryStore);
const { countries } = storeToRefs(countryStore);

// Derive refs from shared filter store for template bindings
const { stateFilter, categoryFilter, countryFilter, filterVisible } = storeToRefs(filterStore);

// Real-time fuzzy search on the store's filtered list
const { query: searchQuery, results: searchResults } = useProjectSearch(filteredProjectList, { limit: 200 });

// Combine fuzzy search and store filters
const finalProjectList = computed(() => {
  if (searchQuery.value.trim().length < 2) {
    return filteredProjectList.value;
  }
  return searchResults.value;
});

const stateOptions = computed(() => [
  { text: t("project.state.finished"), value: "finished" },
  { text: t("project.state.underConstruction"), value: "under construction" },
  { text: t("project.state.planned"), value: "planned" },
]);

// SearchBar state filter (local – for SearchBar's internal state binding)
const stateFilterSearch = ref<ProjectState>("all");

// Search-active: move the filter bar to the top when the keyboard opens (like HomeView)
const isSearchActive = ref(false);

// Collapse the sticky header when scrolled past the heading
const SCROLL_THRESHOLD = 20;
const headerScrolled = ref(false);

function onScroll() {
  headerScrolled.value = window.scrollY > SCROLL_THRESHOLD;
}

function onSearchFocus() {
  isSearchActive.value = true;
}

function onSearchBlur() {
  isSearchActive.value = false;
}

// Detect keyboard dismissal via visualViewport (e.g. iOS "Done" button)
function onViewportResize() {
  if (!window.visualViewport) return;
  if (window.visualViewport.height >= window.innerHeight - 5) {
    isSearchActive.value = false;
  }
}

onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onViewportResize);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", onViewportResize);
  }
  window.removeEventListener("scroll", onScroll);
});

function handleStateFilterChange(state: ProjectState) {
  stateFilterSearch.value = state;
  if (state === "all") {
    filterStore.stateFilter = [];
  } else {
    filterStore.stateFilter = [state];
  }
}

const activeFilters = computed(() => {
  const filters: { id: string; type: string; name: string; value: any; category: string }[] = [];
  
  stateFilter.value.forEach(s => {
    const opt = stateOptions.value.find(o => o.value === s);
    if (opt) filters.push({ id: `state-${s}`, type: t("search.filterGroups.status"), name: opt.text, value: s, category: "state" });
  });
  
  categoryFilter.value.forEach(c => {
    const cat = categoryList.value.find(cl => cl.value === c);
    if (cat) filters.push({ id: `cat-${c}`, type: t("search.filterGroups.categories"), name: cat.text, value: c, category: "category" });
  });
  
  countryFilter.value.forEach(c => {
    const cou = countryList.value.find(cl => cl.value === c);
    if (cou) filters.push({ id: `cou-${c}`, type: t("search.filterGroups.countries"), name: cou.text, value: c, category: "country" });
  });
  
  return filters;
});

const activeFiltersCount = computed(() => activeFilters.value.length);

function removeFilter(filter: any) {
  if (filter.category === "state") {
    filterStore.stateFilter = filterStore.stateFilter.filter(s => s !== filter.value);
  } else if (filter.category === "category") {
    filterStore.categoryFilter = filterStore.categoryFilter.filter(c => c !== filter.value);
  } else if (filter.category === "country") {
    filterStore.countryFilter = filterStore.countryFilter.filter(c => c !== filter.value);
  }
}

function clearAllFilters() {
  filterStore.stateFilter = [];
  filterStore.categoryFilter = [];
  filterStore.countryFilter = [];
  searchQuery.value = "";
  stateFilterSearch.value = "all";
}

const projectList = computed(() =>
  projects.value.map((project) => ({
    text: project.name,
    value: project.id,
    ...project,
  })),
);

const categoryList = computed(() =>
  categories.value.map((category) => ({
    text: categoryStore.getDisplayName(category.id),
    value: Number(category.id),
    ...category,
  })),
);

const countryList = computed(() =>
  countries.value.map((country) => ({
    text: countryStore.getDisplayName(country.id),
    value: Number(country.id),
    ...country,
  })),
);

const projectCount = computed(() => projectList.value.length);
const projectsPlannedCount = computed(
  () => projectStore.projects.filter((p) => p.state === "planned").length,
);
const projectsUnderConstructionCount = computed(
  () =>
    projectStore.projects.filter((p) => p.state === "under construction")
      .length,
);

onBeforeMount(() => {
  // Load data asynchronously before mount to start fetching earlier
  Promise.all([projectStore.load(), categoryStore.load(), countryStore.load()]);

  // Set default state filters if none are active
  if (filterStore.stateFilter.length === 0) {
    filterStore.stateFilter = ["finished", "planned", "under construction"];
  }
});
</script>

<style lang="postcss" scoped>
/* Shared (base styles outside breakpoints) */
.list-header {
  /* Soft bottom separation — no sharp line, just a whisper of depth */
  @apply shadow-[0_1px_2px_rgba(0,0,0,0.03)];

  /* Smooth animations for collapse/expand on scroll */
  @apply transition-[padding,box-shadow] duration-300 ease-in-out;

  h1, h3 {
    @apply transition-all duration-300 ease-in-out;
  }

  /* Collapsed state: scrolled past the heading */
  &.header-scrolled {
    @apply pt-[0.2rem] pb-[0.1rem] shadow-[0_2px_8px_rgba(0,0,0,0.05)];

    h1 {
      @apply text-base p-0 leading-[1.3];
    }

    h3 {
      @apply opacity-0 m-0 max-h-0 overflow-hidden pointer-events-none;
    }
  }
}

/* Desktop */
@media (min-width: 768px) {
  .project-list {
    @apply p-[var(--spacing-gutter-md)];
  }

  .list-header {
    @apply sticky top-0 z-50 -m-[var(--spacing-gutter-md)] p-[var(--spacing-gutter-md)] pb-0;

    /* Glassmorphism */
    @apply bg-white/85 backdrop-blur-xl;
  }

  .filter-overlay-container {
    @apply [&>*]:relative;
  }

  .toolbar-section {
    @apply py-[calc(var(--spacing-unit)*2)];
  }

  .filter-dropdown {
    @apply absolute top-full left-0 right-0 z-50;
  }
}

/* Mobile */
@media (max-width: 767.98px) {
  .project-list {
    @apply p-[var(--spacing-gutter-md)] pb-[calc(3rem+env(safe-area-inset-bottom,0px)+4rem)];
  }

  .list-header {
    @apply sticky top-0 z-50 -m-[var(--spacing-gutter-md)] p-[var(--spacing-gutter-md)] pb-0;

    /* Glassmorphism */
    @apply bg-white/85 backdrop-blur-xl;

    /* Smaller heading on mobile */
    h1 {
      @apply text-[1.25rem] py-[0.375rem] m-0;
    }

    h3 {
      @apply my-[0.375rem] text-[0.8rem];
    }
  }

  .filter-overlay-container {
    @apply fixed bottom-0 left-0 right-0 z-[1000] flex flex-col-reverse gap-[0.75rem] p-[0.75rem] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))];

    /* When the search input is focused, pop the overlay to the top
       so it stays above the virtual keyboard. */
    &.search-active {
      @apply bottom-auto top-0 flex-col max-h-[50dvh] p-[0.75rem] pt-[calc(env(safe-area-inset-top)+0.75rem)];
    }
  }

  .toolbar-section {
    @apply p-0 relative z-[1001];
  }

  .filter-dropdown {
    @apply relative z-[1000] max-h-[min(50vh,24rem)];
  }
}

/* Shared */
.filter-backdrop {
  @apply hidden;

  @media (max-width: 767.98px) {
    @apply block fixed inset-0 z-[999] bg-black/30;
  }
}

.no-results {
  @apply bg-surface rounded-round-xl my-[var(--spacing-margin-lg)] p-[var(--spacing-margin-lg)] text-center;
}

/* Skeleton Loading */
.skeleton-grid {
  @apply p-[var(--spacing-gutter-md)];
}

.skeleton-card {
  @apply h-full min-h-[180px] border-none rounded-round-xl overflow-hidden shadow-[0_var(--spacing-unit)_calc(var(--spacing-unit)*3)_rgba(9,20,38,0.08)] bg-surface;
}

.skeleton-image-col {
  @apply relative overflow-hidden aspect-square;
}

.skeleton-image {
  @apply block w-full h-full rounded-round-default animate-pulse bg-outline-variant/30;
}

.skeleton-content-col {
  @apply flex flex-col min-h-[180px];
}

.skeleton-content {
  @apply p-[calc(var(--spacing-unit)*2)] flex flex-col gap-[calc(var(--spacing-unit)*1.5)] flex-1;
}

.skeleton-title {
  @apply block h-[1.3rem] rounded-[4px] animate-pulse bg-outline-variant/20;
}

.skeleton-category {
  @apply block h-[0.85rem] rounded-[4px] animate-pulse bg-outline-variant/20;
}

.skeleton-country {
  @apply block h-[0.85rem] rounded-[4px] animate-pulse bg-outline-variant/20;
}
</style>
