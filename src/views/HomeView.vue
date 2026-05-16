<script setup lang="ts">
import { defineAsyncComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useWebFrame } from "@/composables/useWebFrame";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";
import { useFilterStore } from "../stores/filter.store";
import { useProjectSearch, type ProjectState } from "@/composables/useProjectSearch";
import FilterPanel from "@/components/FilterPanel.vue";
import SearchBar from "../components/SearchBar.vue";

const { t } = useI18n();
const router = useRouter();
const { navigateToProject } = useWebFrame();
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

// Map base layer (satellite or OSM)
const baseLayer = ref<'satellite' | 'osm'>('osm');

const stateOptions = computed(() => [
  { text: t("project.state.finished"), value: "finished" },
  { text: t("project.state.underConstruction"), value: "under construction" },
  { text: t("project.state.planned"), value: "planned" },
]);

// Fuzzy search on the store's filtered list
// NOTE: destructure `query` as `searchQuery` so the SearchBar v-model
// binds to the Fuse query directly (Codex #P2).
const { results: searchResults, query: searchQuery } = useProjectSearch(filteredList, { limit: 50 });

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
  navigateToProject(projectId);
}

// Load categories and countries
categoryStore.load();
countryStore.load();

// Keep the search bar above the virtual keyboard on mobile.
// Uses the visualViewport API: when the keyboard opens the visual viewport
// shrinks, so we calculate its offset from the window bottom and apply it
// as an inline `bottom` style on the search overlay.  The map and heading
// are inside a `position:fixed` container (see CSS below) and are therefore
// unaffected by the viewport resize.
const keyboardOffset = ref(0);
function onViewportResize() {
  if (typeof window === "undefined" || !window.visualViewport) return;
  const vv = window.visualViewport;
  const offset = window.innerHeight - vv.offsetTop - vv.height;
  keyboardOffset.value = Math.max(0, Math.round(offset));
}

// iOS Safari scrolls the body when the virtual keyboard opens, shifting
// fixed-position elements.  Cancel the scroll as soon as it happens.
function onViewportScroll() {
  window.scrollTo(0, 0);
}

// Saved values restored on unmount (mobile only)
let savedBodyOverflow = "";
let savedBodyPosition = "";
let savedBodyWidth = "";
let savedBodyTop = "";

// Evaluated once at setup time; mobile state doesn't change during lifecycle
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onViewportResize);
    if (isMobile) {
      window.visualViewport.addEventListener("scroll", onViewportScroll);
    }
  }
  // Lock body scroll on mobile to prevent iOS Safari from shifting fixed elements
  if (isMobile) {
    savedBodyOverflow = document.body.style.overflow;
    savedBodyPosition = document.body.style.position;
    savedBodyWidth = document.body.style.width;
    savedBodyTop = document.body.style.top;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = "0";
  }
});
onUnmounted(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", onViewportResize);
    if (isMobile) {
      window.visualViewport.removeEventListener("scroll", onViewportScroll);
    }
  }
  if (isMobile) {
    document.body.style.overflow = savedBodyOverflow;
    document.body.style.position = savedBodyPosition;
    document.body.style.width = savedBodyWidth;
    document.body.style.top = savedBodyTop;
  }
});
</script>

<template>
  <div class="home">
    <h1>{{ t("app.title") }}</h1>
    
    <!-- Search bar overlay with floating filter -->
    <div
      class="search-overlay"
      :style="keyboardOffset > 0 ? { bottom: keyboardOffset + 'px', paddingBottom: '0.75rem' } : {}"
    >
      <div class="toolbar-section">
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('search.placeholder')"
          :filter-label="t('search.filter')"
          :filter-count="activeFiltersCount"
          :show-filter-chips="false"
          :filter-visible="filterVisible"
          view-mode="map"
          @filter-click="filterVisible = !filterVisible"
          @view-change="(view) => view === 'list' && router.push('/project/')"
        />
      </div>
      
      <!-- Filter backdrop (mobile only) -->
      <div v-if="filterVisible" class="filter-backdrop" @click="filterVisible = false" />

      <!-- Filter Panel -->
      <FilterPanel v-if="filterVisible" @close="filterVisible = false">
        <!-- Map type toggle (nur auf der Karten-Ansicht) -->
        <b-row class="mt-3">
          <b-col cols="12">
            <h6 class="filter-group-title mb-3 d-flex align-items-center gap-2">
              <IBiMap /> {{ t("search.filterGroups.mapType") }}
            </h6>
            <div class="map-type-toggle" role="group" :aria-label="t('search.filterGroups.mapType')">
              <button
                class="map-type-btn"
                :class="{ active: baseLayer === 'satellite' }"
                :aria-pressed="baseLayer === 'satellite'"
                @click="baseLayer = 'satellite'"
              >
                <IBiGlobe2 class="me-1" aria-hidden="true" />
                {{ t("search.mapTypes.satellite") }}
              </button>
              <button
                class="map-type-btn"
                :class="{ active: baseLayer === 'osm' }"
                :aria-pressed="baseLayer === 'osm'"
                @click="baseLayer = 'osm'"
              >
                <IBiMap class="me-1" aria-hidden="true" />
                {{ t("search.mapTypes.map") }}
              </button>
            </div>
          </b-col>
        </b-row>
      </FilterPanel>
      
      <!-- Search results dropdown -->
      <div v-if="searchResults.length > 0 && searchQuery.trim().length >= 2" class="search-results-dropdown" role="listbox" :aria-label="t('search.resultsLabel')">
        <div
          v-for="project in searchResults.slice(0, 10)"
          :key="project.id"
          class="search-result-item"
          role="option"
          tabindex="0"
          @click="handleProjectClick(project.id)"
          @keydown.enter="handleProjectClick(project.id)"
          @keydown.space.prevent="handleProjectClick(project.id)"
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
          <location-map :filtered-projects="filteredList" :base-layer="baseLayer" />
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

  // Desktop: search overlay at the top
  @media (min-width: 768px) {
    .search-overlay {
      position: absolute;
      top: 5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      width: 90%;
      max-width: 600px;
    }

    .filter-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      z-index: 100;
    }
  }

  // Mobile: search floats at the bottom (Apple-style)
  // The filter panel fills the space between search bar and viewport top,
  // adapting dynamically when the keyboard opens (via 100dvh).
  @media (max-width: 767.98px) {
    // Pin the home container to the layout viewport so the map and heading
    // are never resized or repositioned when the virtual keyboard appears.
    // The .search-overlay uses position:fixed and its `bottom` is updated
    // via JavaScript (visualViewport API) to stay above the keyboard.
    & {
      position: fixed;
      inset: 0;
      overflow: hidden;
      overscroll-behavior: none;
    }

    .search-overlay {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column-reverse;
      overflow: hidden;
      max-height: 100dvh;
      padding: 0.75rem;
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
    }

    .toolbar-section {
      position: relative;
      z-index: 1001;
      flex-shrink: 0;
    }

    .filter-dropdown {
      position: relative;
      z-index: 1000;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }

    .filter-scroll {
      max-height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

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

    &:focus-visible {
      outline: 2px solid var(--color-secondary);
      outline-offset: -2px;
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

  // Map type toggle — segmented control
  .map-type-toggle {
    display: flex;
    gap: 0.5rem;
  }

  .map-type-btn {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: var(--font-size-label-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    border: 1px solid var(--color-outline, #c5c6cd);
    background: var(--color-surface, #fff);
    color: var(--color-on-surface, #1e293b);

    &:hover {
      border-color: var(--color-secondary, #3d5e9e);
      background: rgba(61, 94, 158, 0.04);
    }

    &.active {
      background: var(--color-secondary, #3d5e9e);
      border-color: var(--color-secondary, #3d5e9e);
      color: #fff;
      box-shadow: 0 2px 8px rgba(61, 94, 158, 0.25);
    }
  }
}

</style>
