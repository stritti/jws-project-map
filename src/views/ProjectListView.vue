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

        <!-- Unified Toolbar -->
        <div class="toolbar-section mb-3">
          <div class="d-flex flex-wrap gap-3 align-items-stretch">
            <div class="search-input-wrapper flex-grow-1 shadow-sm">
              <IBiSearch class="search-icon" />
              <b-form-input
                v-model="searchQuery"
                placeholder="Name, Kategorie oder Land suchen..."
                class="search-input border-0 shadow-none"
                aria-label="Projekte suchen"
              />
              <kbd class="shortcut-hint d-none d-md-inline ms-2">Ctrl+K</kbd>
            </div>
            
            <b-button 
              @click="filterVisible = !filterVisible" 
              variant="outline-primary" 
              class="filter-toggle-btn d-flex align-items-center gap-2 px-4 shadow-sm fw-bold border-2"
              :class="{ 'active': filterVisible || activeFiltersCount > 0 }"
            >
              <IBiFunnelFill />
              Filter
              <b-badge v-if="activeFiltersCount > 0" pill variant="primary" class="ms-1">{{ activeFiltersCount }}</b-badge>
              <IBiCaretUpFill v-if="filterVisible" />
              <IBiCaretDownFill v-else />
            </b-button>
          </div>

          <!-- Active Filter Pills -->
          <div v-if="activeFilters.length > 0" class="active-filters-pills d-flex flex-wrap gap-2 mt-3 mb-2 px-1">
            <b-badge
              v-for="filter in activeFilters"
              :key="filter.id"
              variant="light"
              pill
              class="filter-pill d-flex align-items-center gap-2 px-3 py-2 border"
            >
              <span class="pill-label text-muted small">{{ filter.type }}:</span>
              <span class="pill-value fw-semibold">{{ filter.name }}</span>
              <IBiX @click="removeFilter(filter)" class="pill-close-icon" title="Entfernen" />
            </b-badge>
            <b-button variant="link" size="sm" class="clear-all-btn text-decoration-none p-0 ms-2" @click="clearAllFilters">
              Alle löschen
            </b-button>
          </div>
        </div>

        <b-collapse id="collapse-filter" v-model:visible="filterVisible">
          <b-card bg-variant="white" class="mb-4 shadow-sm border-0 rounded-4">
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
        </b-collapse>
        <div class="mb-4 text-muted small" v-if="filteredProjectList.length !== finalProjectList.length || activeFiltersCount > 0 || searchQuery">
          <strong>{{ finalProjectList.length }}</strong> Projekte gefunden
        </div>
      </b-placeholder-wrapper>
      <b-overlay :show="showLoadingSpinner" fixed :opacity="0.5">
        <b-card-group columns class="my-3">
          <project-list-item
            v-for="project in finalProjectList"
            :key="project.id"
            :project="project"
          />
        </b-card-group>
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
import { ref, computed, watch, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useLoadingStore } from "../stores/loading.store";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";
import type { Project } from "@/interfaces/Project";
import ProjectListItem from "../components/project/ProjectListItem.vue";
import { useProjectSearch } from "@/composables/useProjectSearch";

const loadingStore = useLoadingStore();
const projectStore = useProjectStore();
const categoryStore = useCategoryStore();
const countryStore = useCountryStore();

const { showLoadingSpinner } = storeToRefs(loadingStore);
const { filteredList: filteredProjectList, projects } =
  storeToRefs(projectStore);
const { categories } = storeToRefs(categoryStore);
const { countries } = storeToRefs(countryStore);

// Real-time fuzzy search
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

const stateFilter = ref<string[]>([]);
const categoryFilter = ref<string[]>([]);
const countryFilter = ref<string[]>([]);
const filterVisible = ref(false);

const activeFilters = computed(() => {
  const filters: { id: string; type: string; name: string; value: any; category: string }[] = [];
  
  stateFilter.value.forEach(s => {
    const opt = stateOptions.find(o => o.value === s);
    if (opt) filters.push({ id: `state-${s}`, type: "Status", name: opt.text, value: s, category: "state" });
  });
  
  categoryFilter.value.forEach(c => {
    const cat = categoryList.value.find(cl => cl.value === Number(c));
    if (cat) filters.push({ id: `cat-${c}`, type: "Kategorie", name: cat.text, value: c, category: "category" });
  });
  
  countryFilter.value.forEach(c => {
    const cou = countryList.value.find(cl => cl.value === Number(c));
    if (cou) filters.push({ id: `cou-${c}`, type: "Land", name: cou.text, value: c, category: "country" });
  });
  
  return filters;
});

const activeFiltersCount = computed(() => activeFilters.value.length);

function removeFilter(filter: any) {
  if (filter.category === "state") {
    stateFilter.value = stateFilter.value.filter(s => s !== filter.value);
  } else if (filter.category === "category") {
    categoryFilter.value = categoryFilter.value.filter(c => c !== filter.value);
  } else if (filter.category === "country") {
    countryFilter.value = countryFilter.value.filter(c => c !== filter.value);
  }
}

function clearAllFilters() {
  stateFilter.value = [];
  categoryFilter.value = [];
  countryFilter.value = [];
  searchQuery.value = "";
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
  Promise.all([
    projectStore.load(),
    categoryStore.load(),
    countryStore.load(),
  ]);

  if (stateFilter.value.length === 0) {
    stateFilter.value = ["finished", "planned", "under construction"];
  }
});

watch(
  [projects, stateFilter, categoryFilter, countryFilter],
  () => {
    // Ensure filters are numeric where necessary
    const categoryFilterIds = categoryFilter.value.map(Number).filter(n => !isNaN(n));
    const countryFilterIds = countryFilter.value.map(Number).filter(n => !isNaN(n));

    // Delegate filtering to the store for consistency
    projectStore.doFilter(
      stateFilter.value,
      categoryFilterIds,
      countryFilterIds
    );
  },
  { immediate: true, deep: true },
);
</script>

<style lang="scss" scoped>
.project-list {
  padding: 1rem;
}

.toolbar-section {
  position: sticky;
  top: 1rem;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 0.5rem 0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem;
  background: #f8f9fa;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 1.25rem;
  transition: all 0.3s ease;
  min-width: 280px;

  &:focus-within {
    background: #fff;
    border-color: var(--jws-primary);
    box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.1) !important;
  }
}

.search-input {
  font-size: 1.1rem;
  font-weight: 500;
  background: transparent;
  color: var(--jws-text);
  
  &::placeholder {
    color: var(--jws-text-muted);
    font-weight: 400;
  }
}

.search-icon {
  font-size: 1.2rem;
  color: var(--jws-primary);
}

.filter-toggle-btn {
  border-radius: 1.25rem;
  transition: all 0.3s ease;
  
  &.active {
    background: var(--jws-primary);
    color: white;
    border-color: var(--jws-primary);
  }
}

.active-filters-pills {
  min-height: 2.5rem;
}

.filter-pill {
  background: white !important;
  color: var(--jws-text) !important;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--jws-primary) !important;
  }
}

.pill-close-icon {
  cursor: pointer;
  font-size: 1.25rem;
  color: #dc3545;
  border-radius: 50%;
  padding: 2px;
  
  &:hover {
    background: rgba(220, 53, 69, 0.1);
  }
}

.filter-group-title {
  color: var(--jws-primary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

.custom-check-group {
  .form-check {
    margin-bottom: 0.5rem;
    padding-left: 1.75rem;
    
    .form-check-input {
      width: 1.2rem;
      height: 1.2rem;
      margin-left: -1.75rem;
      cursor: pointer;
      
      &:checked {
        background-color: var(--jws-primary);
        border-color: var(--jws-primary);
      }
    }
    
    .form-check-label {
      cursor: pointer;
      font-size: 0.95rem;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--jws-primary);
      }
    }
  }
}

.scrollable-group {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0,0,0,0.2);
    }
  }
}

.shortcut-hint {
  font-size: 0.7rem;
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 4px;
  padding: 1px 6px;
  color: var(--jws-text-muted);
}

.no-results {
  background: #f8f9fa;
  border-radius: 2rem;
  margin: 2rem 0;
}
</style>
