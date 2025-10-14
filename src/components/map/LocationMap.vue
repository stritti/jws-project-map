<template>
  <div class="map">
    <b-overlay :show="isLoadingMap" fixed style="height: 100vh" :opacity="0.5">
      <!-- Skeleton loader for map -->
      <div v-if="!mapReady" class="map-skeleton">
        <div class="map-skeleton-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading map...</span>
          </div>
          <p class="mt-2">Loading map...</p>
        </div>
      </div>

      <l-map
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
          v-if="pinsReady && projectsFinished && projectsFinished.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsFinished"
        >
          <!-- Verwende v-memo für bessere Performance bei der Marker-Darstellung -->
          <l-marker
            v-for="loc in projectsFinished"
            v-memo="[loc.id, loc.latitude, loc.longitude, selectedLocation?.id === loc.id]"
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
            <!-- Tooltips nur bei Bedarf rendern, um DOM-Größe zu reduzieren -->
            <l-tooltip v-if="map?.leafletObject?.getZoom() > 7">
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="pinsReady && projectsUnderConstruction && projectsUnderConstruction.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsUnderConstruction"
        >
          <l-marker
            v-for="loc in projectsUnderConstruction"
            v-memo="[loc.id, loc.latitude, loc.longitude, selectedLocation?.id === loc.id]"
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
            <l-tooltip v-if="map?.leafletObject?.getZoom() > 7">
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="pinsReady && projectsPlanned && projectsPlanned.length > 0"
          layer-type="overlay"
          :name="layerLabelProjectsPlanned"
        >
          <l-marker
            v-for="loc in projectsPlanned"
            v-memo="[loc.id, loc.latitude, loc.longitude, selectedLocation?.id === loc.id]"
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
            <l-tooltip v-if="map?.leafletObject?.getZoom() > 7">
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>
        
        <!-- Lade-Indikator für Pins -->
        <div v-if="mapInitialized && !pinsReady" class="pins-loading-indicator">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading pins...</span>
          </div>
          <p>Loading project data...</p>
        </div>
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
const mapReady = ref(true); // Karte sofort als bereit markieren
const mapInitialized = ref(false);
const initialDataLoaded = ref(false);
const pinsReady = ref(false); // Neuer Status für Pins
const selectedLocation = ref<Project | undefined>(undefined);
const mapOptions = ref({
  zoomSnap: 0.5,
  scrollWheelZoom: true,
  touchZoom: true,
  wheelPxPerZoomLevel: 60,
  preferCanvas: true, // Verwende Canvas-Renderer für bessere Performance
  renderer: L.canvas({ 
    padding: 0.5,
    tolerance: 5 // Erhöhte Toleranz für bessere Performance
  }),
  // Reduziere die Anzahl der Neuberechnungen während des Zoomens/Verschiebens
  zoomAnimation: false,
  markerZoomAnimation: false,
  // Deaktiviere Animationen auf mobilen Geräten für bessere Performance
  fadeAnimation: !('ontouchstart' in window),
  // Reduziere die Anzahl der Neuberechnungen während des Zoomens
  updateWhenZooming: false,
  updateWhenIdle: true
});
const map = ref<any>(null);

// Verwende die optimierten Getter aus dem Store
const projectsFinished = computed(() => projectStore.projectsFinished);
const projectsUnderConstruction = computed(() => projectStore.projectsUnderConstruction);
const projectsPlanned = computed(() => projectStore.projectsPlanned);

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
  // Karte ist sofort bereit (mapReady ist bereits true)
  isLoadingMap.value = false;
  
  // Starte das Laden der Projektdaten im Hintergrund
  projectStore.preloadMapData();
});

// Überwache die Projektdaten
watch(
  locations,
  (newLocations) => {
    if (newLocations?.length > 0) {
      initialDataLoaded.value = true;
      pinsReady.value = true; // Pins sind bereit, wenn Daten geladen sind
      
      if (mapInitialized.value && map.value) {
        nextTick(() => {
          updateMaxBounds();
        });
      }
    }
  },
  { deep: true }
);

// Verwende eine debounced Funktion für mapLoaded
const mapLoaded = () => {
  mapInitialized.value = true;
  
  // Karte sofort als geladen markieren
  isLoadingMap.value = false;
  
  // Verwende requestIdleCallback für nicht-kritische Operationen
  // Mit Fallback für Browser ohne Unterstützung
  const useIdleCallback = typeof window.requestIdleCallback === 'function';
  
  // Optimiere die Leaflet-Karte für bessere Performance
  if (map.value?.leafletObject) {
    // Deaktiviere automatisches Zoomen während des Ladens
    map.value.leafletObject.options.trackResize = false;
    
    // Reduziere die Anzahl der Neuberechnungen
    map.value.leafletObject.options.renderer = L.canvas({ 
      padding: 0.5,
      tolerance: 5 // Erhöhte Toleranz für bessere Performance
    });
    
    // Aktiviere Hardwarebeschleunigung, wenn verfügbar
    if (map.value.leafletObject._container) {
      map.value.leafletObject._container.style.transform = 'translateZ(0)';
    }
  }
  
  const loadPins = () => {
    // Wenn wir bereits Daten haben, Pins anzeigen und Grenzen aktualisieren
    if (locations.value.length > 0) {
      pinsReady.value = true;
      updateMaxBounds();
    } else {
      // Wenn keine Daten vorhanden sind, starte das Laden
      projectStore.preloadMapData().then((data) => {
        if (data && data.length > 0) {
          pinsReady.value = true;
          // Verzögere das Aktualisieren der Grenzen, um die Rendering-Performance zu verbessern
          setTimeout(() => updateMaxBounds(), 100);
        }
      });
    }
  };
  
  if (useIdleCallback) {
    window.requestIdleCallback(loadPins, { timeout: 2000 });
  } else {
    // Fallback für Browser ohne requestIdleCallback
    setTimeout(loadPins, 50);
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

// Globale Cache für Pin-URLs und Marker-Klassen - außerhalb der Komponente definiert
// für bessere Performance und Speichernutzung
const PIN_CACHE = new Map<string, string>();
const DEFAULT_PIN = "/pins/default.png";
const MARKER_CLASS_CACHE = new Map<string, string>();

// Computed-Wert für den aktuellen Zoom-Level
const currentZoom = ref(5);

// Überwache Zoom-Änderungen für bedingte Rendering-Optimierungen
watch(() => map.value?.leafletObject, (newMap) => {
  if (newMap) {
    newMap.on('zoomend', () => {
      currentZoom.value = newMap.getZoom();
    });
  }
}, { immediate: true });

// Optimierte Pin-URL-Funktion mit Memoization
const getPin = (location: Project) => {
  if (!location) {
    return DEFAULT_PIN;
  }
  
  // Eindeutigen Schlüssel für den Cache erstellen
  const cacheKey = location.id + '-' + (location.category?.map(c => c.Id).join('-') || 'none');
  
  // Prüfen, ob wir bereits einen Cache-Eintrag haben
  if (PIN_CACHE.has(cacheKey)) {
    return PIN_CACHE.get(cacheKey)!;
  }
  
  try {
    const categories = location.category;
    if (!categories || categories.length === 0) {
      PIN_CACHE.set(cacheKey, DEFAULT_PIN);
      return DEFAULT_PIN;
    }
    
    // Optimierte Kategorienamen-Verarbeitung
    let categoryNames = "";
    const len = categories.length;
    
    for (let i = 0; i < len; i++) {
      const cat = categories[i];
      if (cat && cat.Name) {
        if (categoryNames) categoryNames += "-";
        categoryNames += cat.Name.toLowerCase();
      }
    }
    
    if (!categoryNames) {
      PIN_CACHE.set(cacheKey, DEFAULT_PIN);
      return DEFAULT_PIN;
    }
    
    const pinUrl = `/pins/${categoryNames}.png`;
    PIN_CACHE.set(cacheKey, pinUrl);
    return pinUrl;
  } catch (error) {
    console.error("Error getting pin for location:", error);
    PIN_CACHE.set(cacheKey, DEFAULT_PIN);
    return DEFAULT_PIN;
  }
};

// Optimierte Marker-Klassen-Funktion
const pinClass = (current: Project) => {
  // Eindeutigen Schlüssel für den Cache erstellen
  const cacheKey = `${current.id}-${current.state}-${selectedLocation.value?.id === current.id}`;
  
  // Prüfen, ob wir bereits einen Cache-Eintrag haben
  if (MARKER_CLASS_CACHE.has(cacheKey)) {
    return MARKER_CLASS_CACHE.get(cacheKey)!;
  }
  
  const isSelected = selectedLocation.value?.id === current.id;
  let cssClass = '';
  
  // Optimierte Klassen-Berechnung
  if (current.state) {
    cssClass = `marker-state-${current.state.toLowerCase().replace(" ", "-")}`;
  }
  
  if (isSelected) {
    cssClass = cssClass ? `marker-selected ${cssClass}` : 'marker-selected';
  }
  
  // Ergebnis cachen
  MARKER_CLASS_CACHE.set(cacheKey, cssClass);
  return cssClass;
};

// Optimierte Funktion zum Aktualisieren der Kartengrenzen mit Debouncing
const updateMaxBoundsTimeout = ref<number | null>(null);

const updateMaxBounds = () => {
  // Debounce-Funktion, um mehrere schnell aufeinanderfolgende Aufrufe zu vermeiden
  if (updateMaxBoundsTimeout.value) {
    clearTimeout(updateMaxBoundsTimeout.value);
  }
  
  updateMaxBoundsTimeout.value = window.setTimeout(() => {
    if (!locations.value || locations.value.length === 0 || !map.value?.leafletObject) {
      return;
    }
    
    try {
      // Deaktiviere Animationen während der Berechnung für bessere Performance
      const leafletMap = map.value.leafletObject;
      const wasAnimating = leafletMap.options.animate;
      leafletMap.options.animate = false;
      
      // Verwende eine schnellere Methode zur Berechnung der Grenzen
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      let validPoints = 0;
      
      // Optimierte Schleife für bessere Performance
      const locationsArray = locations.value;
      const len = locationsArray.length;
      
      // Begrenze die Anzahl der zu verarbeitenden Punkte für bessere Performance
      // Bei sehr großen Datensätzen können wir eine Stichprobe nehmen
      const stride = len > 1000 ? Math.floor(len / 1000) : 1;
      
      for (let i = 0; i < len; i += stride) {
        const loc = locationsArray[i];
        const lat = loc.latitude;
        const lng = loc.longitude;
        
        if (typeof lat === "number" && 
            typeof lng === "number" && 
            !isNaN(lat) && 
            !isNaN(lng)) {
          
          minLat = lat < minLat ? lat : minLat;
          maxLat = lat > maxLat ? lat : maxLat;
          minLng = lng < minLng ? lng : minLng;
          maxLng = lng > maxLng ? lng : maxLng;
          validPoints++;
        }
      }
      
      // Nur wenn wir gültige Grenzen haben
      if (validPoints > 0) {
        const bounds = latLngBounds(
          [minLat, minLng],
          [maxLat, maxLng]
        );
        
        // Verwende requestAnimationFrame für flüssigere Animation
        requestAnimationFrame(() => {
          // Verwende eine nicht-animierte Anpassung für bessere Performance
          leafletMap.fitBounds(bounds, { 
            padding: [50, 50],
            animate: false,
            duration: 0
          });
          
          // Stelle die ursprüngliche Animationseinstellung wieder her
          leafletMap.options.animate = wasAnimating;
        });
      }
    } catch (error) {
      console.error("Error updating map bounds:", error);
    }
  }, 200); // Erhöhte Debounce-Zeit für bessere Performance
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

/* Optimierte CSS-Transformationen für bessere Performance */
.leaflet-marker-icon {
  will-change: transform; /* Hinweis für den Browser, dass sich diese Eigenschaft ändern wird */
  transform: translate3d(0, 0, 0); /* Aktiviere Hardware-Beschleunigung */
  backface-visibility: hidden; /* Verhindere Rendering-Probleme */
  perspective: 1000; /* Verbessere 3D-Rendering */
  
  &:hover {
    transform: scale(1.5) translate3d(0, 0, 0);
    filter: drop-shadow(0px 0px 10px rgba(210, 28, 28, 0.75));
  }
}

.marker-selected {
  transform: scale(1.25) translate3d(0, 0, 0);
  filter: drop-shadow(0px 0px 4px rgb(178, 14, 14));
}

.marker-selected:hover {
  transform: scale(1.5) translate3d(0, 0, 0);
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
  /* Aktiviere Hardware-Beschleunigung für die Karte */
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
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

.pins-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
  z-index: 1000;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Optimiere Leaflet-Container für bessere Performance */
.leaflet-container {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

/* Reduziere Animationskosten */
.leaflet-fade-anim .leaflet-tile,
.leaflet-fade-anim .leaflet-popup {
  will-change: opacity;
}
.leaflet-zoom-anim .leaflet-zoom-animated {
  will-change: transform;
}
</style>
