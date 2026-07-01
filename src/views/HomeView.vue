<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from "vue";
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
const LocationMap = defineAsyncComponent(() => import("../components/map/LocationMap.vue"));

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

// Map base layer (CartoDB, satellite or OSM)
const baseLayer = ref<'satellite' | 'osm' | 'carto'>('carto');

// Marker clustering toggle
const clusterEnabled = ref(false);

const stateOptions = computed(() => [
  { text: t("project.state.finished"), value: "finished" },
  { text: t("project.state.underConstruction"), value: "under construction" },
  { text: t("project.state.planned"), value: "planned" },
]);

// Fuzzy search on the store's filtered list
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

// ── Keep search bar visible on mobile when the keyboard opens ──────────
const isSearchActive = ref(false);

function focusMap() {
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

// Backup: detect keyboard dismissal via visualViewport.resize
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
  if (isMobile) {
    document.documentElement.classList.add(BODY_LOCK_CLASS);
    document.body.classList.add(BODY_LOCK_CLASS);
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onViewportResize);
  }
});

onUnmounted(() => {
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
        <div class="mt-3">
          <h6 class="filter-group-title mb-3 flex items-center gap-2">
            <IBiMap /> {{ t("search.filterGroups.mapType") }}
          </h6>
          <div class="map-type-toggle" role="group" :aria-label="t('search.filterGroups.mapType')">
            <button
              class="map-type-btn"
              :class="{ active: baseLayer === 'carto' }"
              :aria-pressed="baseLayer === 'carto'"
              @click="baseLayer = 'carto'"
            >
              <IBiMap class="mr-1" aria-hidden="true" />
              {{ t("search.mapTypes.carto") }}
            </button>
            <button
              class="map-type-btn"
              :class="{ active: baseLayer === 'satellite' }"
              :aria-pressed="baseLayer === 'satellite'"
              @click="baseLayer = 'satellite'"
            >
              <IBiGlobe2 class="mr-1" aria-hidden="true" />
              {{ t("search.mapTypes.satellite") }}
            </button>
            <button
              class="map-type-btn"
              :class="{ active: baseLayer === 'osm' }"
              :aria-pressed="baseLayer === 'osm'"
              @click="baseLayer = 'osm'"
            >
              <IBiMap class="mr-1" aria-hidden="true" />
              {{ t("search.mapTypes.map") }}
            </button>
          </div>
        </div>
        
        <div class="mt-3">
          <div class="flex items-center justify-between">
            <label class="" for="clusterToggle">
              {{ t("search.clusteringToggle") }}
            </label>
            <label class="form-switch mb-0">
              <input class="form-check-input" type="checkbox" id="clusterToggle" v-model="clusterEnabled">
            </label>
          </div>
          <p class="text-onSurface-variant text-label-sm mt-1 mb-0">{{ t("search.clusteringHint") }}</p>
        </div>
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
      <LocationMap :filtered-projects="filteredList" :base-layer="baseLayer" :cluster-enabled="clusterEnabled" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.home {
  /* Skip-to-map link inherits from a11y.css .skip-to-map class */
  h1 {
    @apply fixed top-[env(safe-area-inset-top)] right-[env(safe-area-inset-right)] p-4 ml-[60px] z-10 bg-white/50;
  }

  /* Desktop: search overlay at the top */
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
      z-index: 10;
    }
  }

  /* Mobile: search floats at the bottom (Apple-style) */
  @media (max-width: 767.98px) {
    .home {
      position: fixed;
      inset: 0;
      overflow: hidden;
      overscroll-behavior: none;
    }

    .search-overlay {
      position: fixed;
      bottom: calc(60px + env(safe-area-inset-bottom, 0px));
      top: auto;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column-reverse;
      overflow: hidden;
      max-height: calc(100dvh - 60px - env(safe-area-inset-bottom, 0px));
      padding: 0.75rem;
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
    }

    .search-overlay.search-active {
      bottom: auto;
      top: 0;
      flex-direction: column;
      max-height: 50dvh;
      padding: 0.75rem;
      padding-top: calc(env(safe-area-inset-top) + 0.75rem);
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
      touch-action: pan-y;
    }
  }

  .filter-backdrop {
    display: none;
  }

  @media (max-width: 767.98px) {
    .filter-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 999;
      background-color: rgba(0, 0, 0, 0.3);
    }
  }

  .search-results-dropdown {
    @apply bg-surface border border-outline-variant rounded-round-default mt-[0.5rem] max-h-[300px] overflow-y-auto shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)];
  }

  .search-result-item {
    @apply p-[0.75rem_1rem] cursor-pointer border-b border-outline-variant transition-colors duration-150 last:border-b-0 hover:bg-surface-variant;

    &:focus-visible {
      @apply outline-2 outline-secondary outline-offset-[-2px] bg-surface-variant;
    }
  }

  .result-name {
    @apply font-medium text-onSurface text-body-md;
  }

  .result-meta {
    @apply flex gap-[0.5rem] mt-[0.25rem] text-label-sm;
  }

  .result-state {
    @apply text-onSurface-variant capitalize;
  }

  .result-country {
    @apply text-onSurface-variant;
  }

  .search-result-more {
    @apply text-center p-[0.75rem] text-onSurface-variant italic text-label-sm;
  }

  .project-map {
    @apply absolute inset-0 z-0;
  }

  .map-loading {
    @apply w-full h-screen flex flex-col items-center justify-center bg-surface;
  }

  /* Map type toggle — segmented control */
  .map-type-toggle {
    @apply flex gap-[0.5rem];
  }

  .map-type-btn {
    @apply flex items-center px-4 py-2 rounded-full text-label-md font-semibold cursor-pointer transition-colors duration-150 border border-outline bg-surface text-onSurface hover:border-secondary hover:bg-secondary/10;

    &.active {
      @apply bg-secondary border-secondary text-white shadow-[0_2px_8px_rgba(61,94,158,0.25)];
    }
  }
}

/* Form switch for cluster toggle */
.form-switch {
  @apply inline-block relative;
  line-height: 0;
}

.form-switch .form-check-input {
  @apply w-[2.25rem] h-[1.25rem] rounded-full appearance-none bg-outline-variant transition-[background-color] duration-200 cursor-pointer relative;
  margin: 0;
}

.form-switch .form-check-input:checked {
  @apply bg-secondary;
}

.form-switch .form-check-input::before {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 9999px;
  transition-property: transform;
  transition-duration: 200ms;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.form-switch .form-check-input:checked::before {
  transform: translateX(1rem);
}

</style>
