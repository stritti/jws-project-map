<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onErrorCaptured } from "vue";
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

import { defineAsyncComponent } from "vue";

// Asynchrones Laden zur Auslagerung von Leaflet aus dem Hauptbundle.
// onError: retry up to 3 times to handle transient network issues. After 3
// failures the component gives up (fail()) so Suspense is not stuck forever.
const LocationMap = defineAsyncComponent({
  loader: () => import("../components/map/LocationMap.vue"),
  timeout: 30000,
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry();
    } else {
      console.error("LocationMap failed to load after 3 attempts:", error);
      fail();
    }
  },
});

// Map base layer (CartoDB, satellite or OSM)
const baseLayer = ref<'satellite' | 'osm' | 'carto'>('carto');

// Marker clustering toggle
const clusterEnabled = ref(false);

// Track whether the map component failed to load after all retries
const mapLoadFailed = ref(false);

// Catch errors thrown by the async LocationMap component (e.g. after exhausting
// retries) so Suspense falls back to an error state instead of hanging forever.
onErrorCaptured((err) => {
  console.error("Map component error captured:", err);
  mapLoadFailed.value = true;
  return false; // do not propagate further
});

function reloadPage() {
  window.location.reload();
}

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

function handleProjectClick(project: { id: number; name: string }) {
  navigateToProject(project);
}

// Map data, categories and countries are loaded in main.ts in parallel.
// On HomeView we still hydrate full project records in the background so
// search/cards get complete data without delaying first map paint.
const HYDRATION_IDLE_TIMEOUT_MS = 1500;
const HYDRATION_FALLBACK_DELAY_MS = 150;

let hydrationIdleRequestId: number | null = null;
let hydrationTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

function startBackgroundHydration() {
  const hydrate = () => {
    projectStore.load(false).catch((error) => {
      console.error("Background project hydration failed:", error);
    });
  };

  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    hydrationIdleRequestId = window.requestIdleCallback(hydrate, {
      timeout: HYDRATION_IDLE_TIMEOUT_MS,
    });
    return;
  }

  hydrationTimeoutHandle = setTimeout(hydrate, HYDRATION_FALLBACK_DELAY_MS);
}

// ── Keep search bar visible on mobile when the keyboard opens ──────────
// On mobile the .home container is position:fixed;inset:0 so the map and
// heading NEVER move.  The search overlay normally floats at bottom:0 but
// when the user taps the search input it snaps to top:0 (above the
// keyboard).  On blur it returns to bottom:0.
//
// An additional body lock (.body-locked on html+body) prevents iOS Safari
// from scrolling the document when an input is focused — without this,
// position:fixed elements can shift or disappear on iOS.
// ──────────────────────────────────────────────────────────────────────

const isSearchActive = ref(false);
const mapContainerRef = ref<HTMLElement | null>(null);

function focusMap() {
  // Find the map container and focus it
  const mapEl = document.querySelector(".project-map .map") as HTMLElement;
  if (mapEl) {
    mapEl.focus();
  }
}


function onSearchFocus() {
  isSearchActive.value = true;
}

function onSearchBlur() {
  isSearchActive.value = false;
}

// Backup: detect keyboard dismissal via visualViewport.resize (e.g. iOS
// "Done" button which can hide the keyboard without blurring the input).
function onViewportResize() {
  if (!window.visualViewport) return;
  if (window.visualViewport.height >= window.innerHeight - 5) {
    isSearchActive.value = false;
  }
}

// iOS Safari body lock — prevents the document from scrolling when an
// input is focused, which otherwise misaligns fixed-position elements.
const BODY_LOCK_CLASS = 'body-locked';
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

onMounted(() => {
  startBackgroundHydration();

  if (isMobile) {
    document.documentElement.classList.add(BODY_LOCK_CLASS);
    document.body.classList.add(BODY_LOCK_CLASS);
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onViewportResize);
  }
});

onUnmounted(() => {
  if (
    hydrationIdleRequestId !== null &&
    typeof window !== "undefined" &&
    typeof window.cancelIdleCallback === "function"
  ) {
    window.cancelIdleCallback(hydrationIdleRequestId);
    hydrationIdleRequestId = null;
  }

  if (hydrationTimeoutHandle !== null) {
    clearTimeout(hydrationTimeoutHandle);
    hydrationTimeoutHandle = null;
  }

  document.documentElement.classList.remove(BODY_LOCK_CLASS);
  document.body.classList.remove(BODY_LOCK_CLASS);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", onViewportResize);
  }
});
</script>

<template>
  <div class="home">
    <h1>{{ t("app.title") }}</h1>
    
    <!-- Skip to map link for keyboard users -->
    <a href="#project-map" class="skip-to-map" @click.prevent="focusMap">
      {{ t("a11y.skipToMap") }}
    </a>
    
    <!-- Search bar overlay with floating filter -->
    <div
      class="search-overlay"
      :class="{ 'search-active': isSearchActive }"
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
          @focus="onSearchFocus"
          @blur="onSearchBlur"
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
                :class="{ active: baseLayer === 'carto' }"
                :aria-pressed="baseLayer === 'carto'"
                @click="baseLayer = 'carto'"
              >
                <IBiMap class="me-1" aria-hidden="true" />
                {{ t("search.mapTypes.carto") }}
              </button>
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
        
        <b-row class="mt-3">
          <b-col cols="12">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-check-label font-weight-bold" for="clusterToggle">
                Marker-Clustering
              </label>
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" id="clusterToggle" v-model="clusterEnabled">
              </div>
            </div>
            <p class="text-muted small mt-1 mb-0">Fasst Pins auf der Karte zusammen, um die Performance zu verbessern.</p>
          </b-col>
        </b-row>
      </FilterPanel>
      
      <!-- Screen reader announcement for search result count -->
      <div class="sr-only" role="status" aria-live="polite">
        {{ searchResults.length > 0 ? t("a11y.searchResultsAnnouncement", { count: searchResults.length }) : (searchQuery.trim().length >= 2 ? t("a11y.noResultsAnnouncement") : "") }}
      </div>
      
      <!-- Search results dropdown -->
      <div v-if="searchResults.length > 0 && searchQuery.trim().length >= 2" class="search-results-dropdown" role="listbox" :aria-label="t('search.resultsLabel')">
        <div
          v-for="project in searchResults.slice(0, 10)"
          :key="project.id"
          class="search-result-item"
          role="option"
          tabindex="0"
          @click="handleProjectClick(project)"
          @keydown.enter="handleProjectClick(project)"
          @keydown.space.prevent="handleProjectClick(project)"
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
    
    <div class="project-map" id="project-map">
      <!-- Karte lädt im Hintergrund, Ladeindikator wird über Suspense gesteuert -->
      <div v-if="mapLoadFailed" class="map-loading">
        <p class="text-muted">{{ t("map.loadError") }}</p>
        <button class="btn btn-primary btn-sm mt-2" @click="reloadPage">
          {{ t("common.reload") }}
        </button>
      </div>
      <Suspense v-else>
        <template #default>
          <LocationMap :filtered-projects="filteredList" :base-layer="baseLayer" :cluster-enabled="clusterEnabled" />
        </template>
        <template #fallback>
          <div class="map-loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ t("search.loadingMap") }}</span>
            </div>
            <p class="mt-2 text-muted">{{ t("search.loadingMap") }}</p>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.home {
  // Skip-to-map link inherits from a11y.scss .skip-to-map class
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
      top: auto;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column-reverse;
      overflow: hidden;
      max-height: 100dvh;
      padding: 0.75rem;
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));

      // When the search input is focused, pop the overlay to the top so
      // it stays above the virtual keyboard.  flex-direction flips so the
      // search bar sits at the top edge and results extend downward.
      &.search-active {
        bottom: auto;
        top: 0;
        flex-direction: column;
        max-height: 50dvh;
        padding: 0.75rem;
        padding-top: calc(env(safe-area-inset-top) + 0.75rem);
      }
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
