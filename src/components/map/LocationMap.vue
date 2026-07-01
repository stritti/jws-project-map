<template>
  <div class="map" tabindex="0" ref="mapContainerRef" role="region" :aria-label="t('a11y.skipToMap')" @focus="onMapFocus">
    <!-- Loading placeholder -->
    <div v-if="!mapReady" class="map-loading-placeholder">
      <div class="map-loading-spinner"></div>
      <p>{{ t('map.loading') }}</p>
    </div>
    
    <l-map
      v-else
      ref="map"
      v-model:zoom="zoom"
      class="map"
      crs="EPSG:4326"
      :min-zoom="minZoom"
      :max-zoom="17"
      :bounds="bounds"
      :use-global-leaflet="true"
      :options="mapOptions"
      @click="addMarker"
      @ready="mapLoaded"
    >
      <!-- Low-resolution base layer for initial load -->
      <l-tile-layer
        v-if="baseLayer === 'satellite' && mapReady"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        layer-type="base"
        name="Satellite"
        :attribution="satelliteAttribution"
        :options="tileLayerOptions"
      ></l-tile-layer>

      <l-tile-layer
        v-if="baseLayer === 'carto' && mapReady"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        layer-type="base"
        name="Map Minimal"
        :attribution="cartoAttribution"
        :options="tileLayerOptions"
      ></l-tile-layer>

      <l-tile-layer
        v-if="baseLayer === 'osm' && mapReady"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        :attribution="osmAttribution"
        :options="tileLayerOptions"
      ></l-tile-layer>

      <component :is="LayerComponent"
        v-if="projectsFinished.length > 0 && mapReady"
        layer-type="overlay"
        :name="layerLabelProjectsFinished"
      >
        <l-marker
          v-for="loc in projectsFinished"
          :id="loc.id"
          :key="loc.id"
          :lat-lng="[loc.latitude, loc.longitude]"
          :title="loc.name"
          @click="onMarkerClick(loc)"
        >
          <l-icon
            :icon-url="getPin(loc)"
            :class-name="pinClass(loc)"
            :icon-size="[28, 39]"
            :icon-anchor="[14, 39]"
          ></l-icon>
          <l-tooltip v-if="zoom > 7">
            <span>{{ loc.name }}</span>
            <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
          </l-tooltip>
        </l-marker>
      </component>
      
      <component :is="LayerComponent"
        v-if="projectsUnderConstruction.length > 0 && mapReady"
        layer-type="overlay"
        :name="layerLabelProjectsUnderConstruction"
      >
        <l-marker
          v-for="loc in projectsUnderConstruction"
          :id="loc.id"
          :key="loc.id"
          :lat-lng="[loc.latitude, loc.longitude]"
          :title="loc.name"
          @click="onMarkerClick(loc)"
        >
          <l-icon
            :icon-url="getPin(loc)"
            :class-name="pinClass(loc)"
            :icon-size="[28, 39]"
            :icon-anchor="[14, 39]"
          ></l-icon>
          <l-tooltip v-if="zoom > 7">
            <span>{{ loc.name }}</span>
            <span v-if="loc.state !== 'under construction'"> ({{ loc.state }})</span>
          </l-tooltip>
        </l-marker>
      </component>
      
      <component :is="LayerComponent"
        v-if="projectsPlanned.length > 0 && mapReady"
        layer-type="overlay"
        :name="layerLabelProjectsPlanned"
      >
        <l-marker
          v-for="loc in projectsPlanned"
          :id="loc.id"
          :key="loc.id"
          :lat-lng="[loc.latitude, loc.longitude]"
          :title="loc.name"
          @click="onMarkerClick(loc)"
        >
          <l-icon
            :icon-url="getPin(loc)"
            :class-name="pinClass(loc)"
            :icon-size="[28, 39]"
            :icon-anchor="[14, 39]"
          ></l-icon>
          <l-tooltip v-if="zoom > 7">
            <span>{{ loc.name }}</span>
            <span v-if="loc.state !== 'planned'"> ({{ loc.state }})</span>
          </l-tooltip>
        </l-marker>
      </component>
    </l-map>

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
} from "vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useFilterStore } from "../../stores/filter.store";
import L, { latLngBounds } from "leaflet";
import {
  LMap,
  LLayerGroup,
  LTileLayer,
  LMarker,
  LIcon,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import { LMarkerClusterGroup } from "vue-leaflet-markercluster";
import ProjectDetails from "../../components/project/ProjectDetails.vue";
import projectService from "@/features/projects/services/project.service";
import type { Project } from "@/interfaces/Project";
import { useI18n } from "vue-i18n";
import { announceToScreenReader } from "@/composables/useAccessibility";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const leafletGlobal = globalThis as typeof globalThis & { L?: typeof L };
if (!leafletGlobal.L) {
  leafletGlobal.L = L;
}

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

// Performance optimizations
const minZoom = ref(4);
const zoom = ref(5);
const bounds = ref(
  latLngBounds([
    [-14.5981259, 5.8997233],
    [8.9490075, 11.322326],
  ]),
);
const isOpened = ref(false);
const selectedLocation = ref<Project | undefined>(undefined);
const map = ref<any>(null);
const mapContainerRef = ref<HTMLElement | null>(null);
const mapReady = ref(false);

// Tile layer options for better performance
const tileLayerOptions = {
  maxNativeZoom: 18,
  maxZoom: 18,
  minZoom: 4,
  // Use lower zoom for initial load
  zoomOffset: 0,
  // Enable tile caching
  reuseTiles: true,
  // Reduce the number of tiles loaded initially
  updateWhenIdle: true,
  // Don't load tiles outside the viewport
  keepBuffer: 2,
};

// Attribution strings
const satelliteAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
const cartoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const mapOptions = {
  zoomSnap: 0.5,
  scrollWheelZoom: true,
  touchZoom: true,
  // Performance: defer tile loading until interaction
  preferCanvas: true,
  // Start with lower zoom for faster initial render
  zoom: 4,
};

// Compute project lists from the filtered locations
const projectsFinished = computed(() =>
  locations.value.filter((p) => p.state === "finished"),
);
const projectsUnderConstruction = computed(() =>
  locations.value.filter((p) => p.state === "under construction"),
);
const projectsPlanned = computed(() =>
  locations.value.filter((p) => p.state === "planned"),
);

const layerLabelProjectsFinished = computed(() =>
  t("map.layerFinished", { count: projectsFinished.value.length }),
);
const layerLabelProjectsUnderConstruction = computed(() =>
  t("map.layerUnderConstruction", { count: projectsUnderConstruction.value.length }),
);
const layerLabelProjectsPlanned = computed(() =>
  t("map.layerPlanned", { count: projectsPlanned.value.length }),
);

function onMapFocus() {
  announceToScreenReader(t("a11y.mapInstructions"));
}

const DEFAULT_PIN = "/pins/default.png";
const AVAILABLE_PINS = new Set([
  "default",
  "school",
  "midwife",
  "well",
  "teacher",
  "school-well",
  "well-school",
  "undefined",
]);

const getPin = (location: Project): string => {
  if (!location) return DEFAULT_PIN;

  try {
    const categories = location.category;
    if (!categories || categories.length === 0) return DEFAULT_PIN;

    const categoryNames = categories
      .map((cat) => {
        const name = cat.fields?.Name || String(cat.id);
        return name && name !== "undefined" && name !== "null"
          ? String(name).toLowerCase()
          : null;
      })
      .filter(Boolean)
      .join("-");

    if (!categoryNames) return DEFAULT_PIN;
    if (AVAILABLE_PINS.has(categoryNames)) return `/pins/${categoryNames}.png`;

    const primaryCategory = categoryNames.split("-")[0];
    if (primaryCategory && AVAILABLE_PINS.has(primaryCategory)) {
      return `/pins/${primaryCategory}.png`;
    }

    return DEFAULT_PIN;
  } catch (error) {
    console.error("Error getting pin for location:", error);
    return DEFAULT_PIN;
  }
};

const pinClass = (current: Project): string => {
  const isSelected = selectedLocation.value?.id === current.id;
  let cssClass = "";

  if (current.state) {
    cssClass = `marker-state-${current.state.toLowerCase().replace(" ", "-")}`;
  }

  if (isSelected) {
    cssClass += " marker-selected";
  }

  return cssClass;
};

function onMarkerClick(loc: Project) {
  selectedLocation.value = loc;
  isOpened.value = true;
}

function onSidePanelClose() {
  isOpened.value = false;
  selectedLocation.value = undefined;
}

function addMarker(event: { latlng: { lat: number; lng: number } }) {
  // Empty implementation - marker addition is disabled
}

const mapLoaded = () => {
  if (map.value?.leafletObject) {
    // Add aria-labels to zoom controls for accessibility
    const zoomControl = map.value.leafletObject.zoomControl;
    if (zoomControl?.getContainer) {
      const container = zoomControl.getContainer();
      const zoomIn = container?.querySelector(".leaflet-control-zoom-in");
      const zoomOut = container?.querySelector(".leaflet-control-zoom-out");
      if (zoomIn) zoomIn.setAttribute("aria-label", t("a11y.zoomIn"));
      if (zoomOut) zoomOut.setAttribute("aria-label", t("a11y.zoomOut"));
    }
  }

  // Always set mapReady to true when map is loaded
  // The map can display even without locations
  mapReady.value = true;

  if (locations.value.length > 0) {
    nextTick(() => updateBounds());
  }
};

const updateBounds = () => {
  if (!locations.value.length || !map.value?.leafletObject) return;

  const validLocations = locations.value.filter(
    (loc) => loc.latitude !== undefined && loc.longitude !== undefined,
  );

  if (validLocations.length === 0) return;

  const latlngs = validLocations.map((loc) => [loc.latitude, loc.longitude] as [number, number]);
  const calculatedBounds = latLngBounds(latlngs);

  // Only fit bounds if we have a reasonable number of locations
  if (validLocations.length <= 100) {
    map.value.leafletObject.fitBounds(calculatedBounds, {
      padding: [50, 50],
      maxZoom: 12,
      animate: true,
      duration: 0.5,
    });
  } else {
    // For many locations, just set a reasonable view
    map.value.leafletObject.setView([8.5, -2.5], 5);
  }
};

// Watch for location changes and update bounds
watch(locations, (newLocations) => {
  if (newLocations.length > 0 && map.value?.leafletObject && mapReady.value) {
    nextTick(() => updateBounds());
  }
}, { deep: true });

// Watch for project store initialization
watch(() => projectStore.initialized, (initialized) => {
  if (initialized && locations.value.length > 0 && map.value?.leafletObject && mapReady.value) {
    nextTick(() => updateBounds());
  }
});

// Auto-zoom to projects when they load
watch(() => allProjects.value, (projects) => {
  if (projects.length > 0 && map.value?.leafletObject && mapReady.value) {
    nextTick(() => updateBounds());
  }
}, { deep: true });
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-loading-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--jws-bg);
  z-index: 1000;
  
  .map-loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(61, 94, 158, 0.1);
    border-top-color: var(--jws-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--jws-primary);
    font-weight: 500;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

:deep(.leaflet-top) {
  top: 10px !important;
}

:deep(.leaflet-left) {
  left: 10px !important;
}

:deep(.leaflet-right) {
  right: 10px !important;
}

:deep(.leaflet-bottom) {
  bottom: 30px !important;
}

:deep(.leaflet-control-attribution) {
  font-size: 11px !important;
  background-color: rgba(255, 255, 255, 0.7) !important;
  padding: 2px 5px !important;
}

:deep(.leaflet-marker-icon) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
</style>
