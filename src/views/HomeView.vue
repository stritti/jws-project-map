<script setup lang="ts">
import { defineAsyncComponent, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";
import { useFilterStore } from "../stores/filter.store";
import { useProjectSearch, type ProjectState } from "@/composables/useProjectSearch";
import SearchBar from "../components/SearchBar.vue";

const { t } = useI18n();
const router = useRouter();
const projectStore = useProjectStore();
const categoryStore = useCategoryStore();
const countryStore = useCountryStore();
const filterStore = useFilterStore();

const { filteredList } = storeToRefs(projectStore);
const { categories } = storeToRefs(categoryStore);
const { countries } = storeToRefs(countryStore);

// Derive local refs from shared filter store for template bindings
const { stateFilter, categoryFilter, countryFilter, filterVisible } = storeToRefs(filterStore);

// Map data, categories and countries are already loading in main.ts
// Load full project data in background for the project list
projectStore
  .load(false)
  .catch((err) => console.error("Full project load failed:", err));

// Lazy-load the map component (Leaflet stays out of the initial bundle)
const LocationMap = defineAsyncComponent(
  () => import("../components/map/LocationMap.vue"),
);

// Search functionality
const searchQuery = ref("");

const stateOptions = computed(() => [
  { text: t("project.state.finished"), value: "finished" },
  { text: t("project.state.underConstruction"), value: "under construction" },
  { text: t("project.state.planned"), value: "planned" },
]);

// Fuzzy search on the store's filtered list
const { results: searchResults } = useProjectSearch(filteredList, { limit: 50 });

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

function handleStateFilterChange(state: ProjectState) {
  if (state === "all") {
    filterStore.stateFilter = [];
  } else {
    filterStore.stateFilter = [state];
  }
}

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
}

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

function handleProjectClick(projectId: number) {
  router.push(`/project/${projectId}`);
}

// Load categories and countries
categoryStore.load();
countryStore.load();
</script>

<template>
  <div class="home">
    <h1>{{ t("app.title") }}</h1>
    
    <!-- Search bar overlay -->
    <div class="search-overlay">
      <SearchBar
        v-model="searchQuery"
        :placeholder="t('search.placeholder')"
        :filter-label="t('search.filter')"
        :filter-count="activeFiltersCount"
        :show-filter-chips="false"
        @filter-click="filterVisible = !filterVisible"
      />
      
      <!-- Filter Panel -->
      <b-collapse id="collapse-filter" v-model:visible="filterVisible" class="mt-2">
        <b-card bg-variant="white" class="shadow-sm border-0 rounded-4">
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
      </b-collapse>
      
      <!-- Search results dropdown -->
      <div v-if="searchResults.length > 0 && searchQuery.trim().length >= 2" class="search-results-dropdown">
        <div
          v-for="project in searchResults.slice(0, 10)"
          :key="project.id"
          class="search-result-item"
          @click="handleProjectClick(project.id)"
        >
          <div class="result-name">{{ project.name }}</div>
          <div class="result-meta">
            <span class="result-state">{{ project.state }}</span>
            <span v-if="project.country" class="result-country">{{ project.country.fields.Name }}</span>
          </div>
        </div>
        <div v-if="searchResults.length > 10" class="search-result-more">
          +{{ searchResults.length - 10 }} {{ t("search.more") }}
        </div>
      </div>
    </div>
    
    <div class="project-map">
      <!-- Map and data load in parallel: map tiles show immediately, pins appear when data is ready -->
      <Suspense>
        <template #default>
          <location-map :filtered-projects="filteredList" />
        </template>
        <template #fallback>
          <div class="map-loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ t("search.loadingMap") }}</span>
            </div>
            <p class="mt-2">{{ t("search.loadingMap") }}</p>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.home {
  h1 {
    top: env(safe-area-inset-top);
    right: env(safe-area-inset-right);
    padding: 1rem;
    margin-left: 60px;
    position: absolute;
    z-index: 10;
    background-color: rgba($color: #ffffff, $alpha: 0.5);
  }

  .search-overlay {
    position: absolute;
    top: 5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: 90%;
    max-width: 600px;
  }

  .search-results-dropdown {
    background: var(--color-surface);
    border: 1px solid var(--color-outline-variant);
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .search-result-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--color-outline-variant);
    transition: background-color 0.15s ease;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: var(--color-surface-variant);
    }
  }

  .result-name {
    font-weight: 500;
    color: var(--color-on-surface);
    font-size: var(--font-size-body-md);
  }

  .result-meta {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
    font-size: var(--font-size-label-sm);
  }

  .result-state {
    color: var(--color-on-surface-variant);
    text-transform: capitalize;
  }

  .result-country {
    color: var(--color-on-surface-variant);
  }

  .active-filters-pills {
    min-height: calc(var(--spacing-unit) * 10);
  }

  .filter-pill {
    background: var(--color-surface) !important;
    color: var(--color-on-surface) !important;
    font-weight: var(--font-weight-label-md);
    box-shadow: 0 calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2) rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
    border-radius: var(--shape-round-full);
    font-size: var(--font-size-label-sm);
    
    &:hover {
      border-color: var(--color-secondary) !important;
    }
  }

  .pill-close-icon {
    cursor: pointer;
    font-size: var(--font-size-body-md);
    color: var(--color-error);
    border-radius: 50%;
    padding: 2px;
    
    &:hover {
      background: rgba(var(--color-error-rgb, 186, 26, 26), 0.1);
    }
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

  .shortcut-hint {
    font-size: var(--font-size-label-sm);
    background: var(--color-surface-variant);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--shape-round-default);
    padding: 1px 6px;
    color: var(--color-on-surface-variant);
  }

  .search-result-more {
    text-align: center;
    padding: 0.75rem;
    color: var(--color-on-surface-variant);
    font-style: italic;
    font-size: var(--font-size-label-sm);
  }

  .project-map {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 1;
  }

  .map-loading {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
  }
}
</style>
