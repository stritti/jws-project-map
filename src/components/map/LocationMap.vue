<template>
  <div class="map" tabindex="0" ref="mapContainerRef" role="region" :aria-label="t('a11y.skipToMap')" @focus="onMapFocus">
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
          v-if="projectsUnderConstruction.length > 0"
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
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </component>

        <component :is="LayerComponent"
          v-if="projectsPlanned.length > 0"
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

const mapOptions = {
  zoomSnap: 0.5,
  scrollWheelZoom: true,
  touchZoom: true,
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

  if (locations.value.length > 0) {
    nextTick(() => updateBounds());
  }
};

watch(locations, (newLocations) => {
  if (newLocations.length > 0 && map.value?.leafletObject) {
    nextTick(() => updateBounds());
  }
});

const addMarker = (event: {
  latlng: any;
  originalEvent: { ctrlKey: any; altKey: any };
}) => {
  if (
    zoom.value >= 9 &&
    event.latlng &&
    event.originalEvent.ctrlKey &&
    event.originalEvent.altKey
  ) {
    const name = prompt("Enter name:", "__TBD__");
    if (name) {
      projectService.add(event.latlng, name);
    }
  }
};

const onMarkerClick = (location: Project) => {
  selectedLocation.value = location;
  isOpened.value = true;
};

const onSidePanelClose = () => {
  selectedLocation.value = undefined;
  isOpened.value = false;
};

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
    cssClass = cssClass ? `marker-selected ${cssClass}` : "marker-selected";
  }

  return cssClass;
};

function getHeadingOffset(): number {
  const heading = document.querySelector<HTMLElement>('.home h1');
  if (!heading) return 80;
  return Math.round(heading.getBoundingClientRect().bottom) + 8;
}

const updateBounds = () => {
  if (!locations.value.length || !map.value?.leafletObject) return;

  try {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    let validPoints = 0;

    for (const loc of locations.value) {
      const lat = loc.latitude;
      const lng = loc.longitude;
      if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        validPoints++;
      }
    }

    if (validPoints > 0) {
      const calculatedBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
      const topPad = getHeadingOffset();
      map.value.leafletObject.fitBounds(calculatedBounds, {
        paddingTopLeft: [50, topPad],
        paddingBottomRight: [50, 50],
      });
    }
  } catch (error) {
    console.error("Error updating map bounds:", error);
  }
};
</script>

<style lang="postcss">
.leaflet-top {
  @apply top-[calc(var(--spacing-unit)*12.5+env(safe-area-inset-top))];
}
.leaflet-left {
  @apply left-[env(safe-area-inset-left)];
}
.leaflet-right {
  @apply right-[env(safe-area-inset-right)];
}
.leaflet-bottom {
  @apply bottom-[env(safe-area-inset-bottom)];
}
.leaflet-control-attribution {
  @apply max-w-[calc(100vw-var(--spacing-unit)*21.25)] text-[calc(var(--spacing-unit)*1.875)];
}

.leaflet-marker-icon {
  &:hover {
    @apply scale-150 drop-shadow-[0px_0px_10px_rgba(210,28,28,0.75)];
  }
}

.marker-selected {
  @apply scale-125 drop-shadow-[0px_0px_4px_rgb(178,14,14)];
}

.marker-selected:hover {
  @apply scale-150 drop-shadow-[0px_0px_10px_rgba(210,28,28,0.75)];
}

.marker-state-planned {
  @apply grayscale-[90%] opacity-50;
}
.marker-state-under-construction {
  @apply grayscale-[80%] opacity-90;
}
.marker-state-finished {
  @apply opacity-100;
}

.map {
  @apply w-full h-full;
}

.map:focus-visible {
  @apply outline-3 outline-primary outline-offset-[-3px] z-10;
}

/* Zoom controls nur auf Desktop anzeigen */
</style>
