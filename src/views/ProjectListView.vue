<template>
  <b-container>
    <div class="project-list">
      <h1>{{ t("app.title") }}</h1>

      <b-placeholder-wrapper :loading="showLoadingSpinner">
        <template #loading>
          <div class="skeleton-grid">
            <b-row class="g-4">
              <b-col v-for="n in 6" :key="n" cols="12" md="6" lg="4">
                <div class="skeleton-card">
                  <b-row no-gutters class="g-0 h-100">
                    <b-col cols="5" class="skeleton-image-col">
                      <b-placeholder class="skeleton-image" animation="wave" />
                    </b-col>
                    <b-col cols="7" class="skeleton-content-col">
                      <div class="skeleton-content">
                        <b-placeholder class="skeleton-title" animation="wave" />
                        <b-placeholder class="skeleton-category" animation="wave" width="65%" />
                        <b-placeholder class="skeleton-country" animation="wave" width="45%" />
                      </div>
                    </b-col>
                  </b-row>
                </div>
              </b-col>
            </b-row>
          </div>
        </template>

        <h3 class="my-3 text-muted fs-5">
          {{ t("search.stats", { total: projectCount, ub: projectsUnderConstructionCount, pl: projectsPlannedCount }) }}
        </h3>

        <!-- Filter overlay container – sticky, filter overlays the list -->
        <div class="filter-overlay-container">
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
            />
          </div>

          <!-- Filter backdrop (mobile only) -->
          <div v-if="filterVisible" class="filter-backdrop" @click="filterVisible = false" />

          <!-- Filter panel overlays the list via absolute positioning -->
          <div v-if="filterVisible" class="filter-dropdown">
            <b-card bg-variant="white" class="shadow-sm border-0 rounded-4 filter-card">
              <b-row>
                <b-col md="4">
                  <div class="filter-group mb-4 mb-md-0">
                    <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
                      <IBiCheck2Circle /> {{ t("search.filterGroups.status") }}
                    </h6>
                    <b-form-checkbox-group
                      v-model="stateFilter"
                      name="stateFilter"
                      stack
                      class="custom-check-group"
                    >
                      <b-form-checkbox v-for="opt in stateOptions" :key="opt.value" :value="opt.value">
                         {{ opt.text }}
                      </b-form-checkbox>
                    </b-form-checkbox-group>
                  </div>
                </b-col>
                <b-col md="4">
                  <div class="filter-group mb-4 mb-md-0">
                    <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
                      <IBiTag /> {{ t("search.filterGroups.categories") }}
                    </h6>
                    <b-form-checkbox-group
                      v-model="categoryFilter"
                      stack
                      class="custom-check-group scrollable-group"
                    >
                      <b-form-checkbox v-for="cat in categoryList" :key="cat.value" :value="cat.value">
                        {{ cat.text }}
                      </b-form-checkbox>
                    </b-form-checkbox-group>
                  </div>
                </b-col>
                <b-col md="4">
                  <div class="filter-group">
                    <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
                      <IBiGeoAlt /> {{ t("search.filterGroups.countries") }}
                    </h6>
                    <b-form-checkbox-group
                      v-model="countryFilter"
                      stack
                      class="custom-check-group scrollable-group"
                    >
                      <b-form-checkbox v-for="c in countryList" :key="c.value" :value="c.value">
                        {{ c.text }}
                      </b-form-checkbox>
                    </b-form-checkbox-group>
                  </div>
                </b-col>
              </b-row>
            </b-card>
          </div>
        </div>
        <div class="mb-4 text-muted small" v-if="filteredProjectList.length !== finalProjectList.length || activeFiltersCount > 0 || searchQuery">
          {{ t("search.resultsCount", { count: finalProjectList.length }) }}
        </div>
      </b-placeholder-wrapper>
      <b-overlay :show="showLoadingSpinner" fixed :opacity="0.5">
        <b-row class="my-3 g-4">
          <b-col
            v-for="project in finalProjectList"
            :key="project.id"
            cols="12"
            md="6"
            lg="4"
          >
            <project-list-item
              :project="project"
              :to="`/project/${project.id}`"
              class="h-100"
            />
          </b-col>
        </b-row>
        <div v-if="finalProjectList.length === 0" class="no-results py-5 text-center">
          <div class="display-1 text-muted opacity-25 mb-4">
            <IBiEmojiDizzy />
          </div>
          <h3>{{ t("search.noResultsTitle") }}</h3>
          <p class="text-muted">{{ t("search.noResultsHint") }}</p>
          <b-button @click="clearAllFilters" variant="outline-primary" class="mt-3 rounded-pill px-4">
            {{ t("search.resetFilters") }}
          </b-button>
        </div>
      </b-overlay>
    </div>
  </b-container>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
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
import SearchBar from "../components/SearchBar.vue";

const { t } = useI18n();
const loadingStore = useLoadingStore();
const projectStore = useProjectStore();
const categoryStore = useCategoryStore();
const countryStore = useCountryStore();
const filterStore = useFilterStore();

const { showLoadingSpinner } = storeToRefs(loadingStore);
const { filteredList: filteredProjectList, projects } =
  storeToRefs(projectStore);
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

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

// ── Desktop ──────────────────────────────────────────
@media (min-width: 768px) {
  .project-list {
    padding: var(--spacing-gutter-md);
  }

  .filter-overlay-container {
    position: sticky;
    top: 0;
    z-index: 100;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(var(--color-surface-rgb, 248, 249, 250), 0.95);
      backdrop-filter: blur(10px);
      pointer-events: none;
    }

    > * {
      position: relative;
    }
  }

  .toolbar-section {
    padding: calc(var(--spacing-unit) * 2) 0;
  }

  .filter-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
  }
}

// ── Mobile ──────────────────────────────────────────
@media (max-width: 767.98px) {
  .project-list {
    padding: var(--spacing-gutter-md);
    padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px) + 4rem);
  }

  .filter-overlay-container {
    position: fixed;
    bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
    left: 0.75rem;
    right: 0.75rem;
    z-index: 1000;
    display: flex;
    flex-direction: column-reverse;
    gap: 0.75rem;

    &::before {
      display: none;
    }
  }

  .toolbar-section {
    padding: 0;
    position: relative;
    z-index: 1001;
  }

  .filter-dropdown {
    position: relative;
    z-index: 1000;
    max-height: min(50vh, 24rem);
  }
}

// ── Shared ──────────────────────────────────────────
.filter-backdrop {
  display: none;

  @media (max-width: 767.98px) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.3);
  }
}

.filter-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08) !important;
}

.filter-group-title {
  color: var(--color-secondary);
  font-weight: var(--font-weight-label-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: var(--font-size-label-sm);
}

.custom-check-group {
  .form-check {
    margin-bottom: calc(var(--spacing-unit) * 2);
    padding-left: calc(var(--spacing-unit) * 7);
    
    .form-check-input {
      width: calc(var(--spacing-unit) * 5);
      height: calc(var(--spacing-unit) * 5);
      margin-left: calc(-1 * var(--spacing-unit) * 7);
      cursor: pointer;
      border-radius: var(--shape-round-default);
      
      &:checked {
        background-color: var(--color-secondary);
        border-color: var(--color-secondary);
      }
    }
    
    .form-check-label {
      cursor: pointer;
      font-size: var(--font-size-body-md);
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--color-secondary);
      }
    }
  }
}

.scrollable-group {
  max-height: 250px;
  overflow-y: auto;
  padding-right: calc(var(--spacing-unit) * 2);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-outline-variant);
    border-radius: 3px;
    
    &:hover {
      background: var(--color-outline);
    }
  }
}

.no-results {
  background: var(--color-surface);
  border-radius: var(--shape-round-xl);
  margin: var(--spacing-margin-lg) 0;
  padding: var(--spacing-margin-lg);
}

/* ── Skeleton Loading ───────────────────────────── */
.skeleton-grid {
  padding: var(--spacing-gutter-md) 0;
}

.skeleton-card {
  height: 100%;
  min-height: 180px;
  border: none;
  border-radius: var(--shape-round-xl);
  overflow: hidden;
  box-shadow: 0 var(--spacing-unit) calc(var(--spacing-unit) * 3) rgba(9, 20, 38, 0.08);
  background: var(--color-surface);
}

.skeleton-image-col {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
}

.skeleton-image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--shape-round-default);
}

.skeleton-content-col {
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.skeleton-content {
  padding: calc(var(--spacing-unit) * 2);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
  flex: 1;
}

.skeleton-title {
  display: block;
  height: 1.3rem;
  border-radius: 4px;
}

.skeleton-category {
  display: block;
  height: 0.85rem;
  border-radius: 4px;
}

.skeleton-country {
  display: block;
  height: 0.85rem;
  border-radius: 4px;
}
</style>
