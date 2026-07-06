<template>
  <div 
    class="map" 
    tabindex="0" 
    ref="mapContainerRef" 
    role="region" 
    :aria-label="t('a11y.skipToMap')"
    @focus="onMapFocus"
    @keydown="onMapKeydown"
  >
    <client-only>
      <l-map
        v-if="isLeafletLoaded"
        ref="map"
        v-model:zoom="zoom"
        class="map"
        crs="EPSG:4326"
        :min-zoom="4"
        :max-zoom="17"
        :center="center"
        :use-global-leaflet="true"
        :options="mapOptions"
        @click="addMarker"
        @ready="mapLoaded"
        aria-label="Interactive map showing project locations in West Africa"
      >
        <l-tile-layer
          v-if="baseLayer === 'satellite'"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          layer-type="base"
          name="Satellite"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        ></l-tile-layer>

        <l-tile-layer
          v-if="baseLayer === 'carto'"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          layer-type="base"
          name="Map Minimal"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        ></l-tile-layer>

        <l-tile-layer
          v-if="baseLayer === 'osm'"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        ></l-tile-layer>

        <component :is="LayerComponent"
          v-if="projectsFinished.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsFinished"
          aria-label="Finished projects"
        >
          <l-marker
            v-for="loc in projectsFinished"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            :title="loc.name"
            @click="onMarkerClick(loc)"
            :aria-label="`${loc.name}, ${t('project.state.finished')}`"
            role="button"
            tabindex="0"
            @keydown.enter="onMarkerClick(loc)"
            @keydown.space.prevent="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip v-if="zoom > 7" role="tooltip">
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </component>

        <component :is="LayerComponent"
          v-if="projectsUnderConstruction.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsUnderConstruction"
          aria-label="Projects under construction"
        >
          <l-marker
            v-for="loc in projectsUnderConstruction"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            :title="loc.name"
            @click="onMarkerClick(loc)"
            :aria-label="`${loc.name}, ${t('project.state.underConstruction')}`"
            role="button"
            tabindex="0"
            @keydown.enter="onMarkerClick(loc)"
            @keydown.space.prevent="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip v-if="zoom > 7" role="tooltip">
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </component>

        <component :is="LayerComponent"
          v-if="projectsPlanned.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsPlanned"
          aria-label="Planned projects"
        >
          <l-marker
            v-for="loc in projectsPlanned"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            :title="loc.name"
            @click="onMarkerClick(loc)"
            :aria-label="`${loc.name}, ${t('project.state.planned')}`"
            role="button"
            tabindex="0"
            @keydown.enter="onMarkerClick(loc)"
            @keydown.space.prevent="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip v-if="zoom > 7" role="tooltip">
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </component>
      </l-map>
    </client-only>

    <project-details
      :project="selectedLocation"
      :is-opened="isOpened"
      @close="onSidePanelClose"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
} from "vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useFilterStore } from "../../stores/filter.store";
import ProjectDetails from "../../components/project/ProjectDetails.vue";
import projectService from "@/features/projects/services/project.service";
import type { Project } from "@/interfaces/Project";
import { useI18n } from "vue-i18n";
import { announceToScreenReader } from "@/composables/useAccessibility";

// Lazy load Leaflet and related components
const isLeafletLoaded = ref(false);
let L: typeof import("leaflet");
let LMap: any, LLayerGroup: any, LTileLayer: any, LMarker: any, LIcon: any, LTooltip: any;
let LMarkerClusterGroup: any;

// Load Leaflet dynamically to improve LCP
onMounted(async () => {
  try {
    // Load Leaflet CSS first
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletCSS.crossOrigin = '';
    document.head.appendChild(leafletCSS);

    // Load MarkerCluster CSS
    const markerClusterCSS = document.createElement('link');
    markerClusterCSS.rel = 'stylesheet';
    markerClusterCSS.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
    document.head.appendChild(markerClusterCSS);

    const markerClusterDefaultCSS = document.createElement('link');
    markerClusterDefaultCSS.rel = 'stylesheet';
    markerClusterDefaultCSS.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
    document.head.appendChild(markerClusterDefaultCSS);

    // Load Leaflet and vue-leaflet dynamically
    const [leafletModule, vueLeafletModule, markerClusterModule] = await Promise.all([
      import('leaflet'),
      import('@vue-leaflet/vue-leaflet'),
      import('vue-leaflet-markercluster'),
    ]);

    L = leafletModule.default;
    ({ LMap, LLayerGroup, LTileLayer, LMarker, LIcon, LTooltip } = vueLeafletModule);
    ({ LMarkerClusterGroup } = markerClusterModule);

    // Set global L for compatibility
    const leafletGlobal = globalThis as typeof globalThis & { L?: typeof L };
    if (!leafletGlobal.L) {
      leafletGlobal.L = L;
    }

    isLeafletLoaded.value = true;
  } catch (error) {
    console.error('Failed to load Leaflet:', error);
  }
});

const projectStore = useProjectStore();
const { t } = useI18n();

const { projects: allProjects } = storeToRefs(projectStore);

// Props
const props = defineProps({
  filteredProjects: {
    type: Array as () => Project[],
    default: () => [],
  },
  baseLayer: {
    type: String as () => 'satellite' | 'osm' | 'carto',
    default: 'carto',
  },
  clusterEnabled: {
    type: Boolean,
    default: false,
  },
});

const LayerComponent = computed(() => {
  return props.clusterEnabled ? LMarkerClusterGroup : LLayerGroup;
});

// Use filtered projects if provided, otherwise use all projects.
const locations = computed(() => {
  if (props.filteredProjects.length > 0) return props.filteredProjects;
  const filterStore = useFilterStore();
  const hasActiveFilters =
    filterStore.stateFilter.length > 0 ||
    filterStore.categoryFilter.length > 0 ||
    filterStore.countryFilter.length > 0;
  if (hasActiveFilters) return [];
  return allProjects.value;
});

const zoom = ref(5);
// Default center for the map (fallback when no locations are available)
// This is roughly the center of the default bounds (Africa region)
const center = ref<[number, number]>([0, 8]);
const isOpened = ref(false);
const selectedLocation = ref<Project | undefined>(undefined);
const map = ref<any>(null);
const mapContainerRef = ref<HTMLElement | null>(null);

function onMapFocus() {
  announceToScreenReader(t("a11y.mapInstructions"));
}

function onMapKeydown(e: KeyboardEvent) {
  // Handle keyboard navigation for the map
  if (!map.value) return;
  
  const mapInstance = map.value.leafletObject;
  if (!mapInstance) return;
  
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      mapInstance.panBy([0, -50]);
      break;
    case 'ArrowDown':
      e.preventDefault();
      mapInstance.panBy([0, 50]);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      mapInstance.panBy([-50, 0]);
      break;
    case 'ArrowRight':
      e.preventDefault();
      mapInstance.panBy([50, 0]);
      break;
    case '+':
    case '=':
      e.preventDefault();
      mapInstance.zoomIn();
      announceToScreenReader(t("a11y.zoomIn"));
      break;
    case '-':
    case '_':
      e.preventDefault();
      mapInstance.zoomOut();
      announceToScreenReader(t("a11y.zoomOut"));
      break;
    case 'Escape':
      // Close any open popups
      if (isOpened.value) {
        e.preventDefault();
        onSidePanelClose();
      }
      break;
  }
}

const mapOptions = {
  zoomSnap: 0.5,
  scrollWheelZoom: true,
  // Accessibility: Allow keyboard interaction
  keyboard: true,
  keyboardPanDelta: 50,
};

const projectsFinished = computed(() =>
  locations.value.filter((loc) => loc.state === "finished")
);
const projectsUnderConstruction = computed(() =>
  locations.value.filter((loc) => loc.state === "under construction")
);
const projectsPlanned = computed(() =>
  locations.value.filter((loc) => loc.state === "planned")
);

const layerLabelProjectsFinished = computed(() =>
  t("map.layerFinished", { count: projectsFinished.value.length })
);
const layerLabelProjectsUnderConstruction = computed(() =>
  t("map.layerUnderConstruction", { count: projectsUnderConstruction.value.length })
);
const layerLabelProjectsPlanned = computed(() =>
  t("map.layerPlanned", { count: projectsPlanned.value.length })
);

function getPin(loc: Project) {
  if (loc.state === "finished") {
    return projectService.getPinForProject(loc);
  }
  return projectService.getPinForProject(loc, true);
}

function pinClass(loc: Project) {
  return loc.state === "finished" ? "pin-finished" : "pin-planned";
}

function onMarkerClick(loc: Project) {
  selectedLocation.value = loc;
  isOpened.value = true;
  // Announce to screen readers
  announceToScreenReader(`Project: ${loc.name}`);
}

function onSidePanelClose() {
  isOpened.value = false;
  selectedLocation.value = undefined;
}

function addMarker(event: any) {
  // Handle map click - could add new marker functionality here
  console.log("Map clicked at:", event.latlng);
}

function mapLoaded() {
  // Map is ready
  if (map.value) {
    const mapInstance = map.value.leafletObject;
    if (mapInstance) {
      // Set initial view if we have locations
      if (locations.value.length > 0) {
        const bounds = L.latLngBounds(
          locations.value.map((loc) => [loc.latitude, loc.longitude])
        );
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }
}

// Watch for location changes and update map bounds
watch(
  () => locations.value,
  () => {
    if (map.value && locations.value.length > 0) {
      const mapInstance = map.value.leafletObject;
      if (mapInstance) {
        const bounds = L.latLngBounds(
          locations.value.map((loc) => [loc.latitude, loc.longitude])
        );
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  },
  { deep: true }
);
</script>

<style scoped lang="postcss">
.map {
  @apply w-full h-full min-h-screen;
}

/* Focus styles for keyboard navigation */
.map:focus-visible {
  @apply outline-2 outline-secondary outline-offset-2;
}
</style>
