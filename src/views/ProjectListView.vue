<template>
  <b-container>
    <div class="project-list">
      <h1>JWF + Humanaktiv: Project Overview</h1>

      <b-placeholder-wrapper :loading="showLoadingSpinner">
        <template #loading>
          <h3><b-placeholder width="75%"></b-placeholder></h3>
          <p>
            <b-placeholder width="85%"></b-placeholder>
            <b-placeholder width="55%"></b-placeholder>
            <b-placeholder width="70%"></b-placeholder>
          </p>
          <b-card-group columns class="my-3">
            <BPlaceholderCard animation="wave" no-footer />
            <BPlaceholderCard animation="wave" no-footer />
            <BPlaceholderCard animation="wave" no-footer />
          </b-card-group>
        </template>

        <h3 class="my-3 text-muted fs-5">
          {{ projectCount }} Projekte (davon:
          {{ projectsUnderConstructionCount }} im Bau,
          {{ projectsPlannedCount }} geplant)
        </h3>

        <!-- Filter overlay container – sticky, filter overlays the list -->
        <div class="filter-overlay-container">
          <div class="toolbar-section">
            <SearchBar
              v-model="searchQuery"
              v-model:state-filter="stateFilterSearch"
              placeholder="Name, Kategorie oder Land suchen..."
              filter-label="Filter"
              :show-filter-chips="false"
              :filter-count="activeFiltersCount"
              @filter-click="filterVisible = !filterVisible"
              @state-change="handleStateFilterChange"
            />
          </div>

          <!-- Filter panel overlays the list via absolute positioning -->
          <div v-if="filterVisible" class="filter-dropdown">
            <b-card bg-variant="white" class="shadow-sm border-0 rounded-4 filter-card">
              <b-row>
                <b-col md="4">
                  <div class="filter-group mb-4 mb-md-0">
                    <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
                      <IBiCheck2Circle /> Status
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
                      <IBiTag /> Kategorien
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
                      <IBiGeoAlt /> Länder
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
          <strong>{{ finalProjectList.length }}</strong> Projekte gefunden
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
          <h3>Keine Projekte gefunden</h3>
          <p class="text-muted">Passen Sie Ihre Suchanfrage oder Filter an.</p>
          <b-button @click="clearAllFilters" variant="outline-primary" class="mt-3 rounded-pill px-4">
            Filter zurücksetzen
          </b-button>
        </div>
      </b-overlay>
    </div>
  </b-container>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
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

const stateOptions = [
  { text: "Abgeschlossen", value: "finished" },
  { text: "Im Bau", value: "under construction" },
  { text: "Geplant", value: "planned" },
];

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
    const opt = stateOptions.find(o => o.value === s);
    if (opt) filters.push({ id: `state-${s}`, type: "Status", name: opt.text, value: s, category: "state" });
  });
  
  categoryFilter.value.forEach(c => {
    const cat = categoryList.value.find(cl => cl.value === c);
    if (cat) filters.push({ id: `cat-${c}`, type: "Kategorie", name: cat.text, value: c, category: "category" });
  });
  
  countryFilter.value.forEach(c => {
    const cou = countryList.value.find(cl => cl.value === c);
    if (cou) filters.push({ id: `cou-${c}`, type: "Land", name: cou.text, value: c, category: "country" });
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
    text: category.name,
    value: Number(category.id),
    ...category,
  })),
);

const countryList = computed(() =>
  countries.value.map((country) => ({
    text: country.name,
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

.project-list {
  padding: var(--spacing-gutter-md);
  position: relative;
}

.filter-overlay-container {
  position: sticky;
  top: 0;
  z-index: 100;

  // Backdrop behind toolbar so content doesn't show through
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(var(--color-surface-rgb, 248, 249, 250), 0.95);
    backdrop-filter: blur(10px);
    pointer-events: none;
  }

  > * {
    position: relative; // stack above the backdrop
  }
}

.toolbar-section {
  padding: calc(var(--spacing-unit) * 2) 0;
}

.filter-dropdown {
  position: absolute;
  top: 100%; // directly below the toolbar
  left: 0;
  right: 0;
  z-index: 50;
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
</style>
