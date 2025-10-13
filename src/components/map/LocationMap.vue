<template>
  <div class="map">
    <b-overlay :show="isLoadingMap" fixed style="height: 100vh" :opacity="0.5">
      <!-- Skeleton loader for map -->
      <div v-if="!mapReady" class="map-skeleton">
        <div class="map-skeleton-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading map...</span>
          </div>
          <p class="mt-2">Loading map data...</p>
        </div>
      </div>

      <l-map
        v-if="mapReady"
        ref="map"
        v-model:zoom="zoom"
        class="map"
        crs="EPSG:4326"
        :min-zoom="4"
        :max-zoom="17"
        :bounds="bounds"
        :max--bounds="maxBounds"
        :use-global-leaflet="true"
        :options="mapOptions"
        @click="addMarker"
        @ready="mapLoaded"
      >
        <l-control-layers
          ref="control"
          position="bottomright"
        ></l-control-layers>
        <l-tile-layer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          layer-type="base"
          name="Satellite"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        ></l-tile-layer>

        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        ></l-tile-layer>

        <l-layer-group
          v-if="projectsFinished"
          layer-type="overlay"
          :name="layerLabelProjectsFinished"
        >
          <l-marker
            v-for="loc in projectsFinished"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            @click="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip>
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="projectsUnderConstruction"
          layer-type="overlay"
          :name="layerLabelProjectsUnderConstruction"
        >
          <l-marker
            v-for="loc in projectsUnderConstruction"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            @click="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip>
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="projectsPlanned"
          layer-type="overlay"
          :name="layerLabelProjectsPlanned"
        >
          <l-marker
            v-for="loc in projectsPlanned"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            @click="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip>
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>
      </l-map>
    </b-overlay>
    <project-details
      :project="selectedLocation"
      :is-opened="isOpened"
      @close="onSidePanelClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import { useLoadingStore } from "../../stores/loading.store";
import { useCategoryStore } from "../../stores/category.store";
import { useProjectStore } from "../../stores/project.store";
import {
  latLngBounds,
  featureGroup,
  Marker,
  LatLng,
} from "leaflet";
import {
  LMap,
  LControlLayers,
  LLayerGroup,
  LTileLayer,
  LMarker,
  LIcon,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import ProjectDetails from "../../components/project/ProjectDetails.vue";
import projectService from "../../services/project.service";
import type { Project } from "@/interfaces/Project";

const loadingStore = useLoadingStore();
const categoryStore = useCategoryStore();
const projectStore = useProjectStore();

const { getById: getCategoryById } = storeToRefs(categoryStore);
const { showLoadingSpinner } = storeToRefs(loadingStore);
const { projects: locations } = storeToRefs(projectStore);

const zoom = ref(5);
const bounds = ref(
  latLngBounds([
    [-14.5981259, 5.8997233],
    [8.9490075, 11.322326],
  ])
);
const maxBounds = ref(
  latLngBounds([
    [-14.6, 5.9],
    [8.9490075, 11.322326],
  ])
);
const isOpened = ref(false);
const isLoadingMap = ref(true);
const mapReady = ref(false);
const mapInitialized = ref(false);
const initialDataLoaded = ref(false);
const selectedLocation = ref<Project | undefined>(undefined);
const mapOptions = ref({
  zoomSnap: 0.5,
  scrollWheelZoom: true,
  touchZoom: true,
  wheelPxPerZoomLevel: 60,
  preferCanvas: true,
  renderer: L.canvas({ padding: 0.5 }), // Verwende Canvas-Renderer für bessere Performance
});
const map = ref<any>(null);

// Schnellere Berechnung der gefilterten Projekte
const projectsByState = computed(() => {
  const result = {
    finished: [] as Project[],
    'under construction': [] as Project[],
    planned: [] as Project[]
  };
  
  locations.value.forEach(loc => {
    if (loc.state && result[loc.state as keyof typeof result]) {
      result[loc.state as keyof typeof result].push(loc);
    }
  });
  
  return result;
});

const projectsFinished = computed(() => projectsByState.value.finished);
const projectsUnderConstruction = computed(() => projectsByState.value['under construction']);
const projectsPlanned = computed(() => projectsByState.value.planned);

const layerLabelProjectsFinished = computed(
  () => `Projects: finished (${projectsFinished.value.length})`
);
const layerLabelProjectsUnderConstruction = computed(
  () => `Projects: under construction (${projectsUnderConstruction.value.length})`
);
const layerLabelProjectsPlanned = computed(
  () => `Projects: planned (${projectsPlanned.value.length})`
);

// Sofort mit dem Laden der Karte beginnen
onBeforeMount(() => {
  // Karte sofort als bereit markieren
  mapReady.value = true;
  
  // Wenn bereits Daten vorhanden sind, diese verwenden
  if (locations.value.length > 0) {
    initialDataLoaded.value = true;
  }
});

watch(
  locations,
  (newLocations) => {
    if (newLocations?.length > 0) {
      initialDataLoaded.value = true;
      if (mapInitialized.value && map.value) {
        nextTick(() => {
          updateMaxBounds();
        });
      }
    }
  },
  { deep: true }
);

const mapLoaded = () => {
  mapInitialized.value = true;
  
  // Karte sofort als geladen markieren, wenn wir Daten haben
  if (locations.value.length > 0) {
    updateMaxBounds();
  }
  
  // Sofort den Ladeindikator ausblenden
  isLoadingMap.value = false;
  
  // Wenn noch keine Daten geladen wurden, im Hintergrund laden
  if (locations.value.length === 0) {
    projectStore.preloadMapData();
  }
};

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

const getPin = (location: Project) => {
  if (!location) {
    return "/pins/default.png";
  }
  try {
    const categories = location.category;
    if (!categories || categories.length === 0) {
      return "/pins/default.png";
    }
    const categoryNames = categories
      .map((cat) => cat?.Name?.toLowerCase() || "default")
      .filter((name) => name)
      .join("-");
    if (!categoryNames) {
      return "/pins/default.png";
    }
    return `/pins/${categoryNames}.png`;
  } catch (error) {
    console.error("Error getting pin for location:", location, error);
    return "/pins/default.png";
  }
};

const pinClass = (current: Project) => {
  let cssClass =
    selectedLocation.value?.id === current.id ? "marker-selected" : "";
  cssClass +=
    " marker-state-" + current.state?.toLowerCase().replace(" ", "-");
  return cssClass;
};

// Optimierte Funktion zum Aktualisieren der Kartengrenzen
const updateMaxBounds = () => {
  if (!locations.value || locations.value.length === 0 || !map.value?.leafletObject) {
    return;
  }
  
  try {
    // Verwende eine schnellere Methode zur Berechnung der Grenzen
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    // Nur einmal über die Daten iterieren
    for (const loc of locations.value) {
      if (loc && 
          typeof loc.latitude === "number" && 
          typeof loc.longitude === "number" && 
          !isNaN(loc.latitude) && 
          !isNaN(loc.longitude)) {
        
        minLat = Math.min(minLat, loc.latitude);
        maxLat = Math.max(maxLat, loc.latitude);
        minLng = Math.min(minLng, loc.longitude);
        maxLng = Math.max(maxLng, loc.longitude);
      }
    }
    
    // Nur wenn wir gültige Grenzen haben
    if (minLat < 90 && maxLat > -90 && minLng < 180 && maxLng > -180) {
      const bounds = latLngBounds(
        [minLat, minLng],
        [maxLat, maxLng]
      );
      
      map.value.leafletObject.fitBounds(bounds, { 
        padding: [50, 50],
        animate: true,
        duration: 0.5
      });
    }
  } catch (error) {
    console.error("Error updating map bounds:", error);
  }
};
</script>

<style lang="scss">
@import "leaflet/dist/leaflet.css";

.leaflet-top {
  top: calc(5rem + env(safe-area-inset-top));
}
.leaflet-left {
  left: env(safe-area-inset-left);
}
.leaflet-right {
  right: env(safe-area-inset-right);
}
.leaflet-bottom {
  bottom: env(safe-area-inset-bottom);
}
.leaflet-control-attribution {
  max-width: calc(100vw - 8.5rem);
  font-size: 0.75rem;
}
.leaflet-marker-icon {
  &:hover {
    transform: scale(1.5);
    filter: drop-shadow(0px 0px 10px rgba(210, 28, 28, 0.75));
  }
}
.marker-selected {
  transform: scale(1.25);
  filter: drop-shadow(0px 0px 4px rgb(178, 14, 14));
}

.marker-selected:hover {
  transform: scale(1.5);
  filter: drop-shadow(0px 0px 10px rgba(210, 28, 28, 0.75));
}

.marker-state-planned {
  filter: grayscale(90%) opacity(0.5);
}
.marker-state-under-construction {
  filter: grayscale(80%) opacity(0.9);
}
.marker-state-finished {
  filter: opacity(1);
}

.map {
  width: 100%;
  height: 100%;
}

.map-skeleton {
  width: 100%;
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-skeleton-content {
  text-align: center;
}
</style>
