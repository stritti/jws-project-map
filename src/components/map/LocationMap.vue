<template>
  <div class="map" tabindex="0" ref="mapContainerRef" role="region" :aria-label="t('a11y.skipToMap')" @focus="onMapFocus">
    <b-overlay :show="isLoadingMap" fixed style="height: 100vh" :opacity="0.5">
      <!-- Skeleton loader for map -->
      <div v-if="!mapReady" class="map-skeleton">
        <div class="map-skeleton-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t("search.loadingMap") }}</span>
          </div>
          <p class="mt-2">{{ t("search.loadingMap") }}</p>
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
        <l-tile-layer
          v-if="baseLayer === 'satellite'"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          layer-type="base"
          name="Satellite"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        ></l-tile-layer>

        <l-tile-layer
          v-if="baseLayer === 'osm'"
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
            v-memo="[
              loc.id,
              loc.latitude,
              loc.longitude,
              selectedLocation?.id === loc.id,
              currentZoom > 7,
            ]"
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
            <!-- Tooltips nur bei Bedarf rendern, um DOM-Größe zu reduzieren -->
            <l-tooltip v-if="currentZoom > 7">
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="
            pinsReady &&
            projectsUnderConstruction &&
            projectsUnderConstruction.length > 0
          "
          layer-type="overlay"
          :name="layerLabelProjectsUnderConstruction"
        >
          <l-marker
            v-for="loc in projectsUnderConstruction"
            v-memo="[
              loc.id,
              loc.latitude,
              loc.longitude,
              selectedLocation?.id === loc.id,
              currentZoom > 7,
            ]"
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
            <l-tooltip v-if="currentZoom > 7">
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
            v-memo="[
              loc.id,
              loc.latitude,
              loc.longitude,
              selectedLocation?.id === loc.id,
              currentZoom > 7,
            ]"
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
            <l-tooltip v-if="currentZoom > 7">
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
import {
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
  onBeforeMount,
  shallowRef,
  onBeforeUnmount,
} from "vue";
import { storeToRefs } from "pinia";
import { useLoadingStore } from "../../stores/loading.store";
import { useCategoryStore } from "../../stores/category.store";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useFilterStore } from "@/stores/filter.store";
import L, { latLngBounds } from "leaflet";
import {
  LMap,
  LLayerGroup,
  LTileLayer,
  LMarker,
  LIcon,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import ProjectDetails from "../../components/project/ProjectDetails.vue";
import projectService from "@/features/projects/services/project.service";
import type { Project } from "@/interfaces/Project";
import { useI18n } from "vue-i18n";
import { announceToScreenReader } from "@/composables/useAccessibility";

import "leaflet/dist/leaflet.css";

const loadingStore = useLoadingStore();
const categoryStore = useCategoryStore();
const projectStore = useProjectStore();
const { t } = useI18n();

const { getById: getCategoryById } = storeToRefs(categoryStore);
const { showLoadingSpinner } = storeToRefs(loadingStore);
const { projects: allProjects } = storeToRefs(projectStore);

// Props
const props = defineProps({
  filteredProjects: {
    type: Array as () => Project[],
    default: () => [],
  },
  baseLayer: {
    type: String as () => 'satellite' | 'osm',
    default: 'osm',
  },
});

// Version counter bumped when filteredProjects reference changes, used to
// invalidate bounds cache so different filter results get fresh fitBounds (Codex #P2).
const locationsVersion = ref(0);
watch(() => props.filteredProjects, () => { locationsVersion.value++; });

// Use filtered projects if provided, otherwise use all projects.
// When filters are active but produce zero matches, show empty map (Codex #P2).
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

// Verwende shallowRef für nicht-reaktive Objekte für bessere Performance
const zoom = ref(5);
const bounds = shallowRef(
  latLngBounds([
    [-14.5981259, 5.8997233],
    [8.9490075, 11.322326],
  ]),
);
const maxBounds = shallowRef(
  latLngBounds([
    [-14.6, 5.9],
    [8.9490075, 11.322326],
  ]),
);
const isOpened = ref(false);
const isLoadingMap = ref(true);
const mapReady = ref(true); // Karte sofort als bereit markieren
const mapInitialized = ref(false);
const initialDataLoaded = ref(false);
const pinsReady = ref(false); // Neuer Status für Pins
const selectedLocation = shallowRef<Project | undefined>(undefined);
const mapOptions = ref({
  zoomSnap: 0.5,
  scrollWheelZoom: true,
  touchZoom: true,
  wheelPxPerZoomLevel: 60,
  preferCanvas: true, // Verwende Canvas-Renderer für bessere Performance
  renderer: L.canvas({
    padding: 0.5,
    tolerance: 5, // Erhöhte Toleranz für bessere Performance
  }) as any,
  // Reduziere die Anzahl der Neuberechnungen während des Zoomens/Verschiebens
  zoomAnimation: false,
  markerZoomAnimation: false,
  // Deaktiviere Animationen auf mobilen Geräten für bessere Performance
  fadeAnimation: !("ontouchstart" in window),
  // Reduziere die Anzahl der Neuberechnungen während des Zoomens
  updateWhenZooming: false,
  updateWhenIdle: true,
});
const map = ref<any>(null);
const mapContainerRef = ref<HTMLElement | null>(null);

// Announce map keyboard instructions when it receives focus
function onMapFocus() {
  announceToScreenReader(t("a11y.mapInstructions"));
}

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

// Sofort mit dem Laden der Karte beginnen
onBeforeMount(() => {
  // Karte ist sofort bereit (mapReady ist bereits true)
  isLoadingMap.value = false;
});

// Überwache die Projektdaten – immediate:true damit bereits persistierte Daten sofort greifen
watch(
  locations,
  (newLocations) => {
    if (newLocations) {
      initialDataLoaded.value = true;
      pinsReady.value = true;

      if (mapInitialized.value && map.value) {
        nextTick(() => {
          updateMaxBounds();
        });
      }
    }
  },
  { immediate: true },
);

// Wird aufgerufen, wenn die Leaflet-Karte bereit ist
const mapLoaded = () => {
  mapInitialized.value = true;
  isLoadingMap.value = false;

  // Optimiere die Leaflet-Karte für bessere Performance
  if (map.value?.leafletObject) {
    // Deaktiviere automatisches Zoomen während des Ladens
    map.value.leafletObject.options.trackResize = false;

    // Reduziere die Anzahl der Neuberechnungen
    map.value.leafletObject.options.renderer = L.canvas({
      padding: 0.5,
      tolerance: 5, // Erhöhte Toleranz für bessere Performance
    }) as any;

    // Aktiviere Hardwarebeschleunigung, wenn verfügbar
    if (map.value.leafletObject._container) {
      map.value.leafletObject._container.style.transform = "translateZ(0)";

      // Optimiere DOM-Rendering
      map.value.leafletObject._container.style.willChange = "transform";
      map.value.leafletObject._container.style.backfaceVisibility = "hidden";
    }

    // Add aria-labels to zoom controls for accessibility
    const zoomControl = map.value.leafletObject.zoomControl;
    if (zoomControl?.getContainer) {
      const container = zoomControl.getContainer();
      const zoomIn = container?.querySelector(".leaflet-control-zoom-in");
      const zoomOut = container?.querySelector(".leaflet-control-zoom-out");
      if (zoomIn) zoomIn.setAttribute("aria-label", t("a11y.zoomIn"));
      if (zoomOut) zoomOut.setAttribute("aria-label", t("a11y.zoomOut"));
    }

    // Optimiere Leaflet-Events
    map.value.leafletObject.options.zoomSnap = 0.5;
    map.value.leafletObject.options.wheelPxPerZoomLevel = 60;
  }

  // Wenn Daten bereits vorhanden sind (z.B. aus persistiertem Store), sofort anzeigen
  if (locations.value.length > 0) {
    pinsReady.value = true;
    nextTick(() => updateMaxBounds());
  }
  // Wenn keine Daten vorhanden, kümmert sich der watch(locations) darum,
  // sobald das Laden abgeschlossen ist
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
// Verwende ein debounced Zoom-Event für bessere Performance
let zoomTimeout: number | null = null;

watch(
  () => map.value?.leafletObject,
  (newMap) => {
    if (newMap) {
      newMap.on("zoomend", () => {
        // Debounce Zoom-Events
        if (zoomTimeout) {
          clearTimeout(zoomTimeout);
        }

        zoomTimeout = window.setTimeout(() => {
          currentZoom.value = newMap.getZoom();
        }, 100);
      });
    }
  },
  { immediate: true },
);

// Bereinige Timeouts beim Unmount
onBeforeUnmount(() => {
  if (zoomTimeout) {
    clearTimeout(zoomTimeout);
  }

  if (updateMaxBoundsTimeout.value) {
    clearTimeout(updateMaxBoundsTimeout.value);
  }
});

// Optimierte Pin-URL-Funktion mit Memoization
const getPin = (location: Project) => {
  if (!location) {
    return DEFAULT_PIN;
  }

  // Eindeutigen Schlüssel für den Cache erstellen
  const cacheKey =
    location.id +
    "-" +
    (location.category?.map((c) => c.id).join("-") || "none");

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
      if (cat) {
        const name = cat.fields?.Name || String(cat.id);
        if (name && name !== "undefined" && name !== "null") {
          if (categoryNames) categoryNames += "-";
          categoryNames += String(name).toLowerCase();
        }
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
  let cssClass = "";

  // Optimierte Klassen-Berechnung
  if (current.state) {
    cssClass = `marker-state-${current.state.toLowerCase().replace(" ", "-")}`;
  }

  if (isSelected) {
    cssClass = cssClass ? `marker-selected ${cssClass}` : "marker-selected";
  }

  // Ergebnis cachen
  MARKER_CLASS_CACHE.set(cacheKey, cssClass);
  return cssClass;
};

// Optimierte Funktion zum Aktualisieren der Kartengrenzen mit Debouncing
const updateMaxBoundsTimeout = ref<number | null>(null);

// Memoization für Kartengrenzen
const boundsCache = new Map<string, any>();

const updateMaxBounds = () => {
  // Debounce-Funktion, um mehrere schnell aufeinanderfolgende Aufrufe zu vermeiden
  if (updateMaxBoundsTimeout.value) {
    clearTimeout(updateMaxBoundsTimeout.value);
  }

  updateMaxBoundsTimeout.value = window.setTimeout(() => {
    if (
      !locations.value ||
      locations.value.length === 0 ||
      !map.value?.leafletObject
    ) {
      return;
    }

    try {
      // Erstelle einen Cache-Schlüssel basierend auf der Anzahl der Standorte
      // Dies ist eine Vereinfachung - in einer realen Anwendung könnte man einen
      // komplexeren Schlüssel basierend auf den tatsächlichen Daten verwenden
      // Nutze locationsVersion um Cache zu invalidieren wenn sich Quelle ändert
      // (verhindert stale bounds bei Filterwechsel mit gleicher Anzahl, Codex #P2)
      const cacheKey = `bounds-v${locationsVersion.value}-${locations.value.length}`;

      // Prüfe, ob wir bereits berechnete Grenzen im Cache haben
      if (boundsCache.has(cacheKey)) {
        const cachedBounds = boundsCache.get(cacheKey);

        // Verwende die gecachten Grenzen
        requestAnimationFrame(() => {
          const leafletMap = map.value.leafletObject;
          leafletMap.fitBounds(cachedBounds, {
            padding: [50, 50],
            animate: false,
            duration: 0,
          });
        });

        return;
      }

      // Deaktiviere Animationen während der Berechnung für bessere Performance
      const leafletMap = map.value.leafletObject;
      const wasAnimating = leafletMap.options.animate;
      leafletMap.options.animate = false;

      // Verwende eine schnellere Methode zur Berechnung der Grenzen
      let minLat = 90,
        maxLat = -90,
        minLng = 180,
        maxLng = -180;
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

        if (
          typeof lat === "number" &&
          typeof lng === "number" &&
          !isNaN(lat) &&
          !isNaN(lng)
        ) {
          minLat = lat < minLat ? lat : minLat;
          maxLat = lat > maxLat ? lat : maxLat;
          minLng = lng < minLng ? lng : minLng;
          maxLng = lng > maxLng ? lng : maxLng;
          validPoints++;
        }
      }

      // Nur wenn wir gültige Grenzen haben
      if (validPoints > 0) {
        const calculatedBounds = latLngBounds(
          [minLat, minLng],
          [maxLat, maxLng],
        );

        // Cache die berechneten Grenzen
        boundsCache.set(cacheKey, calculatedBounds);

        // Verwende requestAnimationFrame für flüssigere Animation
        requestAnimationFrame(() => {
          // Verwende eine nicht-animierte Anpassung für bessere Performance
          leafletMap.fitBounds(calculatedBounds, {
            padding: [50, 50],
            animate: false,
            duration: 0,
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
@use "@/assets/design-tokens.scss" as *;

/* Leaflet CSS is lazy loaded in the script section for better performance */

.leaflet-top {
  top: calc(var(--spacing-unit) * 12.5 + env(safe-area-inset-top)); /* 5rem = 20 * 4px */
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
  max-width: calc(100vw - var(--spacing-unit) * 21.25); /* 8.5rem = 34 * 4px */
  font-size: calc(var(--spacing-unit) * 1.875); /* 0.75rem = 3 * 4px */
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

.map:focus-visible {
  outline: 3px solid #3d5e9e;
  outline-offset: -3px;
  z-index: 5;
}

.map-skeleton {
  width: 100%;
  height: 100vh;
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-skeleton-content {
  text-align: center;
  
  .spinner-border {
    color: var(--color-primary);
  }
  
  p {
    margin-top: var(--spacing-unit);
    font-size: var(--font-size-body-md);
    color: var(--color-on-surface);
  }
}

.pins-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(var(--color-surface-rgb), 0.8);
  padding: calc(var(--spacing-unit) * 3.75); /* 15px */
  border-radius: var(--shape-round-default);
  z-index: 1000;
  text-align: center;
  box-shadow: 0 calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 2.5) rgba(0, 0, 0, 0.1);
  
  .spinner-border {
    color: var(--color-primary);
  }
  
  p {
    margin-top: var(--spacing-unit);
    font-size: var(--font-size-body-md);
    color: var(--color-on-surface);
  }
}

/* Zoom controls nur auf Desktop anzeigen */
@media (max-width: 767.98px) {
  .leaflet-control-zoom {
    display: none !important;
  }
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
